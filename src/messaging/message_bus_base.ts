import { FException, FExceptionAggregate, FExceptionInvalidOperation, FExecutionContext, FInitableBase, FLogger, FLoggerLabelsExecutionContext } from "@freemework/common";

import { DatabaseFactory } from "../data/database_factory";
import { Database } from "../data/database";
import { EgressIdentifier, IngressIdentifier, TopicIdentifier } from "../model";
import { Message } from "../model/message";
import { MessageBus } from "./message_bus";
import { Topic } from "../model/topic";
import { Ingress } from "../model/ingress";
import { Egress, UnsupportedEgressFilterLabelPolicyNeverException } from "../model/egress";
import { LabelHandler } from "../model/label_handler";
import { AbstractLabelsHandler } from "./labels_handler/abstract_labels_handler";
import { ExternalLabelsHandler } from "./labels_handler/external_process_labels_handler";
import { Label } from "../model";
import { DeliveryEvidence } from "../model/delivery_evidence";

export abstract class MessageBusBase extends MessageBus {
	private readonly labelHandlers: Map<TopicIdentifier, ReadonlyArray<AbstractLabelsHandler>>;
	private readonly egressFilterLabels: Map<EgressIdentifier, ReadonlyArray<Label>>;
	protected readonly log: FLogger;

	public constructor(
		protected readonly storage: DatabaseFactory,
	) {
		super();
		this.labelHandlers = new Map();
		this.egressFilterLabels = new Map<EgressIdentifier, ReadonlyArray<Label>>();
		this.log = FLogger.create(MessageBusBase.name);
	}

	protected async onInit(): Promise<void> {
		await this.storage.using(this.initExecutionContext, async (db) => {
			const labelHandlersList: Array<LabelHandler> = await db.listLabelHandlers(this.initExecutionContext);

			const labelHandlerFactory = (labelHandlerModel: LabelHandler): AbstractLabelsHandler => {
				switch (labelHandlerModel.labelHandlerKind) {
					case LabelHandler.Kind.ExternalProcess:
						return new ExternalLabelsHandler(labelHandlerModel.externalProcessPath);
					default:
						throw new FExceptionInvalidOperation(`Unsupported LabelsHandler kind ${labelHandlerModel.labelHandlerKind}`);
				}
			}

			for (const labelHandler of labelHandlersList) {
				let labelHandlers: ReadonlyArray<AbstractLabelsHandler> | undefined = this.labelHandlers.get(labelHandler.topicId);
				if (labelHandlers === undefined) { labelHandlers = []; }
				this.labelHandlers.set(
					labelHandler.topicId,
					Object.freeze([
						labelHandlerFactory(labelHandler),
						...labelHandlers
					])
				);
			}
		});
	}

	protected onDispose(): void | Promise<void> {
		// TODO
	}

	public async getDeliveryEvidences(
		executionContext: FExecutionContext,
		message: Message.Id
	): Promise<DeliveryEvidence[]> {
		return await this.storage.using(executionContext, (db: Database) => db.getSuccessDeliveryEvidences(executionContext, message));
	}
	
	public async publish(
		executionContext: FExecutionContext,
		ingressId: IngressIdentifier,
		message: Message.Id & Message.Data
	): Promise<void> {
		await this.storage.using(
			executionContext,
			async (db: Database) => {
				const topic: Topic = await db.getTopic(executionContext, { ingressId });
				executionContext = new FLoggerLabelsExecutionContext(executionContext, {
					topicId: topic.topicId.value
				});

				const ingress: Ingress = await db.getIngress(executionContext, { ingressId });

				const labelValues: Set<Label["labelValue"]> = new Set();
				const labelHandlers: ReadonlyArray<AbstractLabelsHandler> | undefined
					= this.labelHandlers.get(topic.topicId);

				if (labelHandlers !== undefined) {
					const exs: Array<FException> = [];
					await Promise.all(
						labelHandlers.map(async (labelHandler) => {
							try {
								const resolvedLabels = await labelHandler.execute(executionContext, { ...message });
								for (const resolvedLabel of resolvedLabels) {
									labelValues.add(resolvedLabel);
								}
							} catch (e) {
								exs.push(FException.wrapIfNeeded(e));
							}
						})

					);
					FExceptionAggregate.throwIfNeeded(exs);
				}

				const labels: Array<Label> = [];
				for (const labelValue of labelValues) {
					let label: Label | null = await db.findLabelByValue(executionContext, labelValue);
					if (label === null) {
						label = await db.createLabel(executionContext, { labelValue: labelValue });
					}
					labels.push(label);
				}

				if (labelHandlers !== undefined) {
					this.log.info(executionContext, () => {
						if (labelValues.size > 0) {
							return `Attach labels: ${[...labelValues].map(e => `"${e}"`).join(', ')}`;
						}
						return `No labels for the message`;
					});
				}

				const messageInstance: Message = await db.createMessage(
					executionContext,
					ingressId,
					message.messageId,
					message.messageHeaders,
					message.messageMediaType,
					message.messageIngressBody,
					message.messageBody,
					labels
				);

				await this.onPublish(executionContext, db, ingress, topic, messageInstance);
			}
		);
	}

	public async registerEgress(
		executionContext: FExecutionContext,
		egressId: EgressIdentifier
	): Promise<void> {
		await this.storage.using(
			executionContext,
			async (db) => {
				const egress: Egress = await db.getEgress(executionContext, { egressId });
				await this.onRegisterEgress(executionContext, egress);
			}
		);
	}

	public async registerTopic(
		executionContext: FExecutionContext,
		topicId: TopicIdentifier
	): Promise<void> {
		await this.storage.using(
			executionContext,
			async (db) => {
				const topic: Topic = await db.getTopic(executionContext, { topicId });
				await this.onRegisterTopic(executionContext, topic);
			}
		);
	}

	public async retainChannel(
		executionContext: FExecutionContext,
		topicId: TopicIdentifier,
		egressId: EgressIdentifier
	): Promise<MessageBus.Channel> {
		return await this.storage.using(
			executionContext,
			async (db) => {
				const topic: Topic = await db.getTopic(executionContext, { topicId });
				const egress: Egress = await db.getEgress(executionContext, { egressId });

				if (!this.egressFilterLabels.has(egress.egressId)) {
					const labels: Array<Label> = [];
					for (const labelId of egress.egressFilterLabelIds) {
						const label: Label | null = await db.findLabel(executionContext, { labelId });
						if (label === null) {
							throw new FException(`Can not find label ${labelId.toString()}`);
						}
						labels.push(label);
					}
					this.egressFilterLabels.set(egress.egressId, Object.freeze(labels))
				}

				return await this.onRetainChannel(executionContext, topic, egress);
			}
		);
	}

	protected async matchLabels(
		executionContext: FExecutionContext,
		db: Database,
		egressId: EgressIdentifier,
		messageLabels: ReadonlyArray<Label>
	): Promise<boolean> {
		const { egressFilterLabelPolicy } = await db.getEgress(executionContext, { egressId });

		if (egressFilterLabelPolicy === Egress.FilterLabelPolicy.IGNORE) {
			return true;
		}

		if (egressFilterLabelPolicy === Egress.FilterLabelPolicy.SKIP) {
			return messageLabels.length === 0;
		}

		const messageLabelValues: ReadonlyArray<string> = messageLabels.map(e => e.labelValue);
		const egressLabels: ReadonlyArray<string> | undefined = this.egressFilterLabels.get(egressId)?.map(e => e.labelValue);

		switch (egressFilterLabelPolicy) {
			case Egress.FilterLabelPolicy.LAX: {
				if (egressLabels === undefined) { return true; }
				for (const messageLabel of messageLabelValues) {
					if (egressLabels.includes(messageLabel)) { return true; }
				}
				return false;
			}
			case Egress.FilterLabelPolicy.STRICT: {
				if (egressLabels === undefined) { return true; }
				for (const egressLabel of egressLabels) {
					if (!messageLabelValues.includes(egressLabel)) { return false; }
				}
				return true;
			}
			default:
				throw new UnsupportedEgressFilterLabelPolicyNeverException(egressFilterLabelPolicy);
		}

	}

	protected abstract onPublish(
		executionContext: FExecutionContext,
		db: Database,
		ingress: Ingress,
		topic: Topic,
		message: Message.Id & Message.Data & Message.Labels
	): Promise<void>;

	protected abstract onRegisterEgress(
		executionContext: FExecutionContext,
		egress: Egress
	): Promise<void>;

	protected abstract onRegisterTopic(
		executionContext: FExecutionContext,
		topic: Topic
	): Promise<void>;

	protected abstract onRetainChannel(
		executionContext: FExecutionContext,
		topic: Topic,
		egress: Egress
	): Promise<MessageBus.Channel>;
}

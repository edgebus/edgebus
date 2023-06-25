import { FException, FExceptionAggregate, FExceptionInvalidOperation, FExecutionContext, FInitableBase } from "@freemework/common";

import { DatabaseFactory } from "../data/database_factory";
import { EgressApiIdentifier, IngressApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";
import { Message } from "../model/message";
import { MessageBus } from "./message_bus";
import { Topic } from "../model/topic";
import { Ingress } from "../model/ingress";
import { Egress } from "../model/egress";
import { LabelHandler } from "../model/label_handler";
import { LabelsHandlerBase } from "./labels_handler/labels_handler_base";
import { ExternalLabelsHandler } from "./labels_handler/external_process_labels_handler";
import { Label } from "../model";
import { bind } from "lodash";

export abstract class MessageBusBase extends MessageBus {

	private readonly labelHandlers: Map<TopicApiIdentifier["uuid"], Array<LabelsHandlerBase>>;

	public constructor(
		protected readonly storage: DatabaseFactory,
	) {
		super();
		this.labelHandlers = new Map<TopicApiIdentifier["uuid"], Array<LabelsHandlerBase>>();
	}

	protected async onInit(): Promise<void> {
		await this.storage.using(this.initExecutionContext, async (db) => {
			const labelHandlersList: Array<LabelHandler> = await db.listLabelHandlers(this.initExecutionContext);

			const labelHandlerFactory = (labelHandlerModel: LabelHandler): LabelsHandlerBase => {
				switch (labelHandlerModel.labelHandlerKind) {
					case LabelHandler.Kind.ExternalProcess:
						return new ExternalLabelsHandler(labelHandlerModel.externalProcessPath);
					default:
						throw new FExceptionInvalidOperation(`Unsupported LabelsHandler kind ${labelHandlerModel.labelHandlerKind}`);
				}
			}

			for (const labelHandler of labelHandlersList) {
				if (this.labelHandlers.has(labelHandler.topicId.uuid)) {
					const labelHandlers = this.labelHandlers.get(labelHandler.topicId.uuid);
					if (!labelHandlers) {
						throw new FExceptionInvalidOperation(`Can not get label handlers array for ${labelHandler.topicId.uuid}`);
					}
					labelHandlers.push(labelHandlerFactory(labelHandler))
				} else {
					this.labelHandlers.set(labelHandler.topicId.uuid, [labelHandlerFactory(labelHandler)]);
				}
			}
		});
	}

	protected onDispose(): void | Promise<void> {
		// TODO
	}

	public async publish(
		executionContext: FExecutionContext,
		ingressId: IngressApiIdentifier, message: Message.Id & Message.Data
	): Promise<void> {
		await this.storage.using(
			executionContext,
			async (db) => {
				const topic: Topic = await db.getTopic(executionContext, { ingressId });
				const ingress: Ingress = await db.getIngress(executionContext, { ingressId });

				const createdMessage: Message = await db.createMessage(
					executionContext, ingressId,
					message.messageId, message.headers,
					message.mediaType, message.ingressBody,
					message.body
				);
				const labelHandlers = this.labelHandlers.get(topic.topicId.uuid);

				if (labelHandlers !== undefined) {

					const exs: Array<FException> = []
					const settedLabels: Array<string> = [];

					await Promise.all(labelHandlers
						.map(e => e.execute(executionContext, createdMessage)
							.then(e => settedLabels.push(...e))
							.catch(e => exs.push(FException.wrapIfNeeded(e))))
					)

					FExceptionAggregate.throwIfNeeded(exs);

					const labelValues = new Set(settedLabels);

					for (const value of labelValues) {
						let label: Label | null = await db.findLabelByValue(executionContext, value);
						if (!label) {
							label = await db.createLabel(executionContext, { value });
						}
						await db.bindLabelToMessage(executionContext, createdMessage, label);
					}
				}

				await this.onPublish(
					executionContext, ingress,
					topic, message
				);
			}
		);
	}

	public async registerEgress(
		executionContext: FExecutionContext,
		egressId: EgressApiIdentifier
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
		topicId: TopicApiIdentifier
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
		topicId: TopicApiIdentifier,
		egressId: EgressApiIdentifier
	): Promise<MessageBus.Channel> {
		return await this.storage.using(
			executionContext,
			async (db) => {
				const topic: Topic = await db.getTopic(executionContext, { topicId });
				const egress: Egress = await db.getEgress(executionContext, { egressId });
				return await this.onRetainChannel(executionContext, topic, egress);
			}
		);
	}

	protected abstract onPublish(
		executionContext: FExecutionContext,
		ingress: Ingress,
		topic: Topic,
		message: Message.Id & Message.Data
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

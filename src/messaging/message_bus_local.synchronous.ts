import { FException, FExceptionAggregate, FExceptionInvalidOperation, FExecutionContext, FLoggerLabelsExecutionContext } from "@freemework/common";

import { Delivery, Egress, EgressIdentifier, Ingress, Label, Message, Topic, TopicIdentifier } from "../model";
import { MessageBus } from "./message_bus";
import { MessageBusBase } from "./message_bus_base";
import { DatabaseFactory } from "../data/database_factory";
import { EventChannelBase } from "../utils/event_channel_base";
import { Database } from "../data/database";
import { DeliveryEvidence } from "../model/delivery_evidence";

export class MessageBusLocalSynchronous extends MessageBusBase {
	constructor(storage: DatabaseFactory,) {
		super(storage);

		this._channels = new Map();
	}

	public async getSuccessDeliveryEvidences(
		executionContext: FExecutionContext,
		message: Message.Id
	): Promise<DeliveryEvidence[]> {
		return await this.storage.using(executionContext, (db: Database) => db.getSuccessDeliveryEvidences(executionContext, message));
	}

	protected async onPublish(
		executionContext: FExecutionContext,
		db: Database,
		ingress: Ingress,
		topic: Topic.Instance,
		message: Message.Id & Message.Data & Message.Labels
	): Promise<void> {
		const egress = this.egresses.find(e => e.egressTopicIds.includes(topic.topicId));
		if (!egress) {
			throw new FExceptionInvalidOperation(`Can not find egress for topic ${topic.topicId}`);
		}

		try {
			executionContext = new FLoggerLabelsExecutionContext(executionContext, {
				topicId: topic.topicId.value,
				egressId: egress.egressId.value,
			});


			executionContext = new FLoggerLabelsExecutionContext(executionContext, {
				messageId: message.messageId.value
			});

			await db.lockEgressMessageQueue(
				executionContext, { egressId: egress.egressId, topicId: topic.topicId, messageId: message.messageId }
			);

			try {
				const topicChannelsMap: Map<TopicIdentifier["value"], MessageBusLocalSynchronousEventChannel> | undefined
					= this._channels.get(egress.egressId.value);

				if (topicChannelsMap === undefined || topicChannelsMap.size === 0) {
					throw new FException("No any egress consumers");
				}

				const channel: MessageBusLocalSynchronousEventChannel | undefined = topicChannelsMap.get(topic.topicId.value);
				if (channel === undefined) {
					throw new FException("No any egress consumers");
				}

				const messageLabels: Array<Label> = [];
				// {
				// 	const labelIds: Array<LabelIdentifier> = message.labels.map((l: any) => LabelIdentifier.parse(l.id));
				// 	for (const labelId of labelIds) {
				// 		messageLabels.push(await db.getLabel(executionContext, { labelId }));
				// 	}
				// }

				const eventMessage: Message = {
					messageId: message.messageId,
					messageMediaType: message.messageMediaType,
					messageHeaders: message.messageHeaders,
					messageIngressBody: message.messageIngressBody,
					messageBody: message.messageBody,
					messageLabels
				};

				const event: MessageBus.Channel.Event = {
					source: channel,
					data: eventMessage
				};

				// const isMatchLabels: boolean = await this.matchLabels(executionContext, db, egressId, message.messageLabels);
				const isMatchLabels: boolean = true;
				if (isMatchLabels) {
					await channel.notify(executionContext, event);
				}

				await db.removeEgressMessageQueue(
					executionContext, { egressId: egress.egressId, topicId: topic.topicId, messageId: message.messageId }
				);

				const status: Delivery.Status = isMatchLabels ? Delivery.Status.Success : Delivery.Status.Skip;

				
				await db.createDelivery(executionContext, {
					egressId: egress.egressId,
					topicId: topic.topicId,
					messageId: message.messageId,
					status: isMatchLabels ? Delivery.Status.Success : Delivery.Status.Skip,
					successEvidence: event.deliveryEvidence ?? null
				});

				this.log.info(executionContext, () => `Delivery completed with status '${status}'.`);
			}
			catch (e) {
				try {
					await db.createDelivery(executionContext, {
						egressId: egress.egressId,
						topicId: topic.topicId,
						messageId: message.messageId,
						status: Delivery.Status.Failure,
						failureEvidence: `${e}`
					});
					await db.transactionCommit(executionContext);
				} catch (e2) {
					throw new FExceptionAggregate([
						FException.wrapIfNeeded(e2),
						FException.wrapIfNeeded(e)
					]);
				}
				throw e;
			}
		}
		catch (e) {
			const wrappedException: FException = FException.wrapIfNeeded(e);
			if (wrappedException.message !== "No any egress consumers") {
				this.log.info(executionContext, () => `Delivery failure with error: ${wrappedException.message}`);
				this.log.debug(executionContext, "Delivery failure", wrappedException);
			}
		}

	}
	protected async onRegisterEgress(executionContext: FExecutionContext, egress: Egress): Promise<void> {
		// NOP
	}
	protected async onRegisterTopic(executionContext: FExecutionContext, topic: Topic.Instance): Promise<void> {
		// NOP
	}

	protected async onRetainChannel(executionContext: FExecutionContext, topic: Topic.Instance, egress: Egress): Promise<MessageBus.Channel> {
		if (!this._channels.has(egress.egressId.value)) {
			this._channels.set(egress.egressId.value, new Map());
		}

		const existingChannel: MessageBusLocalSynchronousEventChannel | undefined = this._channels.get(egress.egressId.value)!.get(topic.topicId.value);
		if (existingChannel !== undefined) {
			throw new FExceptionInvalidOperation(`Unable to retain channel for ${egress.egressId.value} due it already used.`);
		}

		const channel: MessageBusLocalSynchronousEventChannel = new MessageBusLocalSynchronousEventChannel(topic.topicName, topic.topicKind, () => {
			this._channels.get(egress.egressId.value)!.delete(topic.topicId.value);
		});

		this._channels.get(egress.egressId.value)!.set(topic.topicId.value, channel);

		return channel;
	}

	protected async onInit(): Promise<void> {
		const executionContext: FExecutionContext = this.initExecutionContext;
		await super.onInit();
		//
		try {
			await this.storage.using(
				executionContext,
				async (db: Database) => {
					const egresses: Array<Egress> = await db.listEgresses(executionContext);
					this.egresses.push(...egresses);
				}
			);
		} catch (e) {
			try {
				await super.onDispose();
			} catch (e2) {
				throw new FExceptionAggregate([FException.wrapIfNeeded(e), FException.wrapIfNeeded(e2)])
			}
			throw e;
		}
	}

	private readonly _channels: Map<EgressIdentifier["value"], Map<TopicIdentifier["value"], MessageBusLocalSynchronousEventChannel>>
	private readonly egresses: Array<Egress> = [];

}

class MessageBusLocalSynchronousEventChannel
	extends EventChannelBase<Message.Id & Message.Data, MessageBus.Channel.Event>
	implements MessageBus.Channel {
	public constructor(
		public readonly topicName: string,
		public readonly topicKind: Topic.Kind,
		private readonly _onDispose: () => void
	) {
		super();
	}

	public notify(executionContext: FExecutionContext, event: MessageBus.Channel.Event): void | Promise<void> {
		return super.notify(executionContext, event);
	}

	protected async onInit(): Promise<void> {
		//
	}
	protected async onDispose(): Promise<void> {
		this._onDispose();
	}
}

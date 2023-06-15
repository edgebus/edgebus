import { FException, FExceptionAggregate, FExceptionInvalidOperation, FExecutionContext } from "@freemework/common";

import { DoneCallback, Job, JobOptions, Queue } from "bull";
import * as Bull from "bull";
import { RedisOptions } from 'ioredis';
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";

import { IngressApiIdentifier, TopicApiIdentifier, EgressApiIdentifier, MessageApiIdentifier } from "../misc/api-identifier";
import { Message } from "../model/message";
import { MessageBus } from "./message_bus";
import { MessageBusBase } from "./message_bus_base";
import { DatabaseFactory } from "../data/database_factory";
import { EventChannelBase } from "../utils/event_channel_base";
import { MIME_APPLICATION_JSON } from "../utils/mime";
import { Database } from "../data/database";
import { Topic } from "../model/topic";
import { Ingress } from "../model/ingress";
import { Egress } from "../model/egress";
import { Bind } from "../utils/bind";
import { unpromise } from "../utils/unpromise";
import { Delivery } from "../model";

/**
 * Implementation of Message Bus top on bull library
 * See: https://www.npmjs.com/package/bull
 */
export class MessageBusBull extends MessageBusBase {
	public get serverAdapterRouter() {
		return this._serverAdapter.getRouter();
	}

	public constructor(
		storage: DatabaseFactory,
		redisUrl: URL,
		public readonly dashboardBindPath: string = '/admin/queues',
		// temporary passed (should be initialized inside)
	) {
		super(storage);

		const db: number = Number.parseInt(redisUrl.pathname.substring(1) ?? '0');
		const port: number = Number.parseInt(redisUrl.port ?? '6379');
		const host: string = redisUrl.hostname;

		const redisOpts: RedisOptions = { host, port, db };
		if (redisUrl.password.length > 0) {
			redisOpts.password = redisUrl.password;
		}
		this._redisOpts = Object.freeze(redisOpts);

		this._channels = new Map();
		this._bullEgressQueues = new Map<EgressApiIdentifier["value"], Queue>();
		this._bullTopicQueues = new Map<TopicApiIdentifier["value"], TopicQueueItem>();

		this._bullJobOpts = Object.freeze({
			attempts: 512,
			backoff: Object.freeze({
				type: "exponential",
				delay: 1000
			})
		});

		this._serverAdapter = new ExpressAdapter();
		this._serverAdapter.setBasePath(dashboardBindPath);

		this._bullBoardController = createBullBoard({
			queues: [],
			serverAdapter: this._serverAdapter,
		});
	}

	protected async onPublish(
		executionContext: FExecutionContext,
		ingress: Ingress,
		topic: Topic,
		message: Message.Id & Message.Data
	): Promise<void> {
		const topicQueueItem: TopicQueueItem = this.getOrRegisterTopicQueue(topic);

		await topicQueueItem.queue.add(
			"TOPIC",
			{
				topicId: topic.topicId.value,
				message: {
					id: message.messageId.value,
					mediaType: message.mediaType,
					headers: message.headers,
					ingressBody: Buffer.from(message.ingressBody).toString("base64"),
					ingressBodyJson: message.mediaType === MIME_APPLICATION_JSON ? JSON.parse(Buffer.from(message.ingressBody).toString()) : null,
					body: Buffer.from(message.body).toString("base64"),
					bodyJson: message.mediaType === MIME_APPLICATION_JSON ? JSON.parse(Buffer.from(message.body).toString()) : null,
				}
			},
			this._bullJobOpts
		);
	}

	protected async onRegisterEgress(
		executionContext: FExecutionContext,
		egress: Egress
	): Promise<void> {
		this.getOrRegisterEgressQueue(egress);
	}

	protected async onRegisterTopic(
		executionContext: FExecutionContext,
		topic: Topic
	): Promise<void> {
		this.getOrRegisterTopicQueue(topic);
	}

	protected async onRetainChannel(
		executionContext: FExecutionContext,
		topic: Topic,
		egress: Egress
	): Promise<MessageBus.Channel> {
		// const queue: Queue = this.getOrRegisterEgressQueue(egress);

		const channel: MessageBusBullEventChannel = new MessageBusBullEventChannel(topic.topicName, () => {
			this._channels.get(egress.egressId.value)!.delete(topic.topicId.value);
		});

		if (!this._channels.has(egress.egressId.value)) {
			this._channels.set(egress.egressId.value, new Map());
		}
		this._channels.get(egress.egressId.value)!.set(topic.topicId.value, channel);
		return channel;
	}

	protected async onInit(): Promise<void> {
		//
		const executionContext: FExecutionContext = this.initExecutionContext;
		await this.storage.using(
			executionContext,
			async (db: Database) => {
				const topics: Array<Topic> = await db.listTopics(executionContext);
				const egresses: Array<Egress> = await db.listEgresses(executionContext);
				for (const topic of topics) {
					this.getOrRegisterTopicQueue(topic);
				}
				for (const egress of egresses) {
					this.getOrRegisterEgressQueue(egress);
				}
			}
		);
	}

	protected onDispose(): void | Promise<void> {
		//
		console.log(`onDispose ${this.constructor.name}`);
	}

	private getOrRegisterTopicQueue(topic: Topic): TopicQueueItem {
		if (this._bullTopicQueues.has(topic.topicId.value)) {
			return this._bullTopicQueues.get(topic.topicId.value)!;
		}

		const queue: Queue = new Bull(`TOPIC:${topic.topicName}`, {
			redis: this._redisOpts,
		});
		const topicQueueItem: TopicQueueItem = Object.freeze({
			queue,
			targetEgressQueues: new Set<[EgressApiIdentifier, Queue]>()
		});
		this._bullTopicQueues.set(topic.topicId.value, topicQueueItem);
		this._bullBoardController.addQueue(new BullAdapter(queue));
		queue.process("TOPIC", this.topicJobProcessor).then(() => {
			console.log("queue.process finished");
		});

		return topicQueueItem;
	}

	private getOrRegisterEgressQueue(egress: Egress): Queue {
		if (this._bullEgressQueues.has(egress.egressId.value)) {
			return this._bullEgressQueues.get(egress.egressId.value)!;
		}

		const topicQueueItems: Array<TopicQueueItem> = egress.egressTopicIds.map(egressTopicId => {
			const topicQueueItem: TopicQueueItem = this.getTopicQueueItem(egressTopicId);
			return topicQueueItem;
		});

		const queue: Queue = new Bull(`EGRESS:${egress.egressId.value}`, {
			redis: this._redisOpts,
		});

		this._bullEgressQueues.set(egress.egressId.value, queue);
		for (const topicQueueItem of topicQueueItems) {
			topicQueueItem.targetEgressQueues.add([egress.egressId, queue]);
		}

		this._bullBoardController.addQueue(new BullAdapter(queue));
		queue.process("EGRESS", this.egressJobProcessor).then(() => {
			console.log("queue.process finished");
		});

		return queue;
	}

	private getTopicQueueItem(topicId: TopicApiIdentifier): TopicQueueItem {
		const topicQueueItem: TopicQueueItem | undefined = this._bullTopicQueues.get(topicId.value);
		if (topicQueueItem === undefined) {
			throw new FExceptionInvalidOperation(`Integrity error. No such topic queue '${topicId.value}'.`);
		}
		return topicQueueItem;
	}

	@Bind
	private egressJobProcessor(job: Job, done: DoneCallback) {
		const executionContext: FExecutionContext = this.initExecutionContext;
		unpromise(
			(async () => {
				try {
					await this.storage.using(executionContext, async (db: Database) => {
						const topicId: TopicApiIdentifier = TopicApiIdentifier.parse(job.data.topicId);
						const egressId: EgressApiIdentifier = EgressApiIdentifier.parse(job.data.egressId);

						const rawMessage = job.data.message;
						const messageId = MessageApiIdentifier.parse(rawMessage.id);

						await db.lockEgressMessageQueue(
							executionContext, { egressId, topicId, messageId }
						);

						try {
							const topicChannelsMap: Map<TopicApiIdentifier["value"], MessageBusBullEventChannel> | undefined
								= this._channels.get(egressId.value);

							if (topicChannelsMap === undefined || topicChannelsMap.size === 0) {
								throw new FException("No any egress consumers");
							}

							const channel: MessageBusBullEventChannel | undefined = topicChannelsMap.get(topicId.value);
							if (channel === undefined) {
								throw new FException("No any egress consumers");
							}

							const message: Message.Id & Message.Data = {
								messageId,
								mediaType: rawMessage.mediaType,
								headers: rawMessage.headers,
								ingressBody: Buffer.from(rawMessage.ingressBody, "base64"),
								body: Buffer.from(rawMessage.body, "base64"),
							};

							const event: MessageBus.Channel.Event = {
								source: channel,
								data: message
							};
							await channel.notify(executionContext, event);

							await db.removeEgressMessageQueue(
								executionContext, { egressId, topicId, messageId }
							);

							await db.createDelivery(executionContext, {
								egressId,
								topicId, messageId,
								status: Delivery.Status.Success,
								successEvidence: event.deliveryEvidence ?? null
							});

							done();
						}
						catch (e) {
							try {
								await db.createDelivery(executionContext, {
									egressId,
									topicId, messageId,
									status: Delivery.Status.Failure,
									failure_evidence: `${e}`
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
					});
				}
				catch (e) {
					done(FException.wrapIfNeeded(e));
				}
			})()
		);
	}

	@Bind
	private topicJobProcessor(job: Job, done: DoneCallback) {
		unpromise(
			(async () => {
				try {
					const topicId: TopicApiIdentifier = TopicApiIdentifier.parse(job.data.topicId);
					const topicQueueItem: TopicQueueItem = this.getTopicQueueItem(topicId);
					for (const [targetEgressId, targetEgressQueue] of topicQueueItem.targetEgressQueues) {
						await targetEgressQueue.add(
							"EGRESS",
							{
								topicId: job.data.topicId,
								egressId: targetEgressId,
								message: job.data.message
							},
							this._bullJobOpts
						);
					}
					done();
				}
				catch (e) {
					done(FException.wrapIfNeeded(e));
				}
			})()
		);
	}

	private readonly _channels: Map<EgressApiIdentifier["value"], Map<TopicApiIdentifier["value"], MessageBusBullEventChannel>>;
	private readonly _bullEgressQueues: Map<EgressApiIdentifier["value"], Queue>;
	private readonly _bullTopicQueues: Map<TopicApiIdentifier["value"], TopicQueueItem>;
	private readonly _serverAdapter: ExpressAdapter;
	private readonly _bullJobOpts: JobOptions;
	private readonly _redisOpts: RedisOptions;
	private readonly _bullBoardController: ReturnType<typeof createBullBoard>;
}

interface TopicQueueItem {
	readonly queue: Queue;
	readonly targetEgressQueues: Set<[EgressApiIdentifier, Queue]>;
}

class MessageBusBullEventChannel
	extends EventChannelBase<Message.Id & Message.Data, MessageBus.Channel.Event>
	implements MessageBus.Channel {
	public constructor(
		public readonly topicName: string,
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

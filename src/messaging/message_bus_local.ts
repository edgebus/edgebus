import { FExceptionInvalidOperation, FExecutionContext, FInitableBase } from "@freemework/common";

import { Message } from "../model/message";
import { Topic } from "../model/topic";

import { MessageBus } from "./message_bus";
import { MessageBusLocalChannelParallel } from "./message_bus_local_parallel";
import { MessageBusLocalChannelSequence } from "./message_bus_local_sequence";
import { MessageBusBase } from "./message_bus_base";
import { EgressApiIdentifier, IngressApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";
import { DatabaseFactory } from "../data/database_factory";

export class MessageBusLocal extends MessageBusBase implements MessageBus {
	private readonly _messageQueues: Map<Topic["topicName"], Map<EgressApiIdentifier, Array<Message>>>;
	private readonly _channels: Map<string, Set<MessageBusLocalChannel>>;
	private _opts: MessageBusLocal.Opts;

	public constructor(storage: DatabaseFactory, opts: MessageBusLocal.Opts) {
		super(storage);
		this._messageQueues = new Map();
		this._channels = new Map();
		this._opts = opts;
	}

	protected async onPublish(
		executionContext: FExecutionContext, ingressId: IngressApiIdentifier, topicName: Topic["topicName"], message: Message
	): Promise<void> {
		const messageId = message.messageId;

		let topicQueuesMap: Map<EgressApiIdentifier, Array<Message>> | undefined = this._messageQueues.get(topicName);
		if (topicQueuesMap === undefined) {
			topicQueuesMap = new Map();
			this._messageQueues.set(topicName, topicQueuesMap);
		}

		for (const [egressId, queue] of topicQueuesMap) {
			console.log(`Forward message '${messageId}' to subscriber ${egressId}`);
			queue.push(message);
			const channelId: string = MessageBusLocal._makeChannelId(topicName, egressId);
			const channels: Set<MessageBusLocalChannel> | undefined = this._channels.get(channelId);
			if (channels !== undefined) {
				if (channels.size === 1) {
					const [channel] = channels;
					channel.wakeUp();
				} else if (channels.size > 1) {
					// When several active subscribers used same channel,
					// do some round-robin (wake up random channel)
					const friendlyChannels = [...channels];
					const randomValue = Math.random();
					const randomChannelIndex = Math.round(randomValue * (friendlyChannels.length - 1));
					const randomChannel = friendlyChannels[randomChannelIndex];
					randomChannel.wakeUp();
				}
			}
		}
	}

	protected async onRetainChannel(
		executionContext: FExecutionContext,
		topicId: TopicApiIdentifier,
		topicName: Topic["topicName"],
		egressId: EgressApiIdentifier
	): Promise<MessageBus.Channel> {
		const channelId: string = MessageBusLocal._makeChannelId(topicName, egressId);

		if (!this._channels.has(channelId)) {
			this._channels.set(channelId, new Set());
		}

		let topicQueuesMap: Map<EgressApiIdentifier, Array<Message>> | undefined = this._messageQueues.get(topicName);
		if (topicQueuesMap === undefined) {
			topicQueuesMap = new Map();
			this._messageQueues.set(topicName, topicQueuesMap);
		}

		let queue = topicQueuesMap.get(egressId);
		if (queue === undefined) {
			queue = [];
			topicQueuesMap.set(egressId, queue);
		}

		let channel: MessageBusLocalChannel;
		const channelDisposer = () => {
			this._channels.get(channelId)!.delete(channel);
		};

		switch (this._opts.deliveryPolicy.type) {
			case MessageBus.DeliveryPolicy.Type.SEQUENCE:
				channel = new MessageBusLocalChannelSequence(topicName, egressId, queue, channelDisposer);
				break;
			case MessageBus.DeliveryPolicy.Type.PARALLEL:
				channel = new MessageBusLocalChannelParallel(topicName, egressId, queue, channelDisposer);
				break;
			default:
				throw new FExceptionInvalidOperation("Unexpected channel type.");
		}

		await channel.init(executionContext);
		this._channels.get(channelId)!.add(channel);
		return channel;
	}

	protected onInit(): void | Promise<void> {
		// TODO
	}

	protected onDispose(): void | Promise<void> {
		// TODO
	}

	private static _makeChannelId(topicName: Topic["topicName"], egressId: EgressApiIdentifier): string {
		const channelId: string = `${egressId.uuid}.${topicName}`;
		return channelId;
	}
}

export namespace MessageBusLocal {
	export interface Opts {
		readonly deliveryPolicy: MessageBus.DeliveryPolicy;
		// TODO
	}
}


type MessageBusLocalChannel = MessageBusLocalChannelSequence | MessageBusLocalChannelParallel;


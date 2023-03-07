import { FExceptionInvalidOperation, FExecutionContext, FInitableBase } from "@freemework/common";

import { Message } from "../model/message";
import { Topic } from "../model/topic";
import { Subscriber } from "../model/subscriber";

import { MessageBus } from "./message_bus";
import { MessageBusLocalChannelParallel } from "./message_bus_local_parallel";
import { MessageBusLocalChannelSequence } from "./message_bus_local_sequence";

export class MessageBusLocal extends FInitableBase implements MessageBus {
	private readonly _messageQueues: Map<Topic["topicName"], Map<Subscriber["subscriberId"], Array<Message>>>;
	private readonly _channels: Map<Subscriber["subscriberId"], Set<MessageBusLocalChannel>>;
	private _opts: MessageBusLocal.Opts;

	public constructor(opts: MessageBusLocal.Opts) {
		super();
		this._messageQueues = new Map();
		this._channels = new Map();
		this._opts = opts;
	}

	public async publish(
		executionContext: FExecutionContext, topicName: Topic["topicName"], message: Message
	): Promise<void> {
		const messageId = message.messageId;

		let topicQueuesMap: Map<Subscriber["subscriberId"], Array<Message>> | undefined = this._messageQueues.get(topicName);
		if (topicQueuesMap === undefined) {
			topicQueuesMap = new Map();
			this._messageQueues.set(topicName, topicQueuesMap);
		}

		for (const [subscriberId, queue] of topicQueuesMap) {
			console.log(`Forward message '${messageId}' to subscriber ${subscriberId}`);
			queue.push(message);
			const channelId: string = MessageBusLocal._makeChannelId(topicName, subscriberId);
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

	public async retainChannel(
		executionContext: FExecutionContext, topicName: Topic["topicName"], subscriberId: Subscriber["subscriberId"]
	): Promise<MessageBus.Channel> {
		const channelId: string = MessageBusLocal._makeChannelId(topicName, subscriberId);

		if (!this._channels.has(channelId)) {
			this._channels.set(channelId, new Set());
		}

		let topicQueuesMap: Map<Subscriber["subscriberId"], Array<Message>> | undefined = this._messageQueues.get(topicName);
		if (topicQueuesMap === undefined) {
			topicQueuesMap = new Map();
			this._messageQueues.set(topicName, topicQueuesMap);
		}

		let queue = topicQueuesMap.get(subscriberId);
		if (queue === undefined) {
			queue = [];
			topicQueuesMap.set(subscriberId, queue);
		}

		let channel: MessageBusLocalChannel;
		const channelDisposer = () => {
			this._channels.get(channelId)!.delete(channel);
		};

		switch (this._opts.deliveryPolicy.type) {
			case MessageBus.DeliveryPolicy.Type.SEQUENCE:
				channel = new MessageBusLocalChannelSequence(topicName, subscriberId, queue, channelDisposer);
				break;
			case MessageBus.DeliveryPolicy.Type.PARALLEL:
				channel = new MessageBusLocalChannelParallel(topicName, subscriberId, queue, channelDisposer);
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

	private static _makeChannelId(topicName: Topic["topicName"], subscriberId: Subscriber["subscriberId"]): string {
		const channelId: string = `${subscriberId}.${topicName}`;
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


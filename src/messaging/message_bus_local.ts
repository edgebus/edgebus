import { FException, FExceptionInvalidOperation, FExecutionContext, FInitableBase } from "@freemework/common";

import { Message } from "../model/message";
import { Topic } from "../model/topic";
import { Subscriber } from "../model/subscriber";
import { EventChannelBase } from "../utils/event_channel_base";

import { MessageBus } from "./message_bus";

export class MessageBusLocal extends FInitableBase implements MessageBus {
	private readonly _messageQueues: Map<Topic["topicName"], Map<Subscriber["subscriberId"], Array<Message>>>;
	private readonly _channels: Map<Subscriber["subscriberId"], MessageBusLocalChannel>;

	public constructor(opts?: MessageBusLocal.Opts) {
		super();
		this._messageQueues = new Map();
		this._channels = new Map();
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
			const channel = this._channels.get(channelId);
			if (channel !== undefined) {
				channel.wakeUp();
			}
		}
	}

	public async retainChannel(
		executionContext: FExecutionContext, topicName: Topic["topicName"], subscriberId: Subscriber["subscriberId"]
	): Promise<MessageBus.Channel> {
		const channelId: string = MessageBusLocal._makeChannelId(topicName, subscriberId);

		if (this._channels.has(channelId)) {
			throw new FExceptionInvalidOperation("Wrong operation. Cannot retain chanel twice.");
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

		const channel = new MessageBusLocalChannel(topicName, subscriberId, queue);
		await channel.init(executionContext);
		this._channels.set(channelId, channel);

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
		// TODO
	}
}


class MessageBusLocalChannel extends EventChannelBase<Message.Id & Message.Data, MessageBus.Channel.Event>
	implements MessageBus.Channel {
	private readonly _queue: Array<Message>;
	private readonly _topicName: Topic["topicName"];
	private readonly _subscriberId: Subscriber["subscriberId"];
	private _tickInterval: NodeJS.Timeout | null;
	private _insideTick: boolean;

	public constructor(topicName: Topic["topicName"], subscriberId: Subscriber["subscriberId"], queue: Array<Message>) {
		super();
		this._topicName = topicName;
		this._subscriberId = subscriberId;
		this._insideTick = false;
		this._queue = queue;
		if (this._queue.length > 0) {
			this._tickInterval = setInterval(this._tick.bind(this), 500);
		} else {
			this._tickInterval = null;
		}
	}

	public get topicName(): Topic["topicName"] { return this._topicName; }

	public onAddFirstHandler() {
		super.onAddFirstHandler();
	}

	public addHandler(cb: MessageBus.Channel.Callback): void {
		super.addHandler(cb);
		this.wakeUp();
	}

	public wakeUp(): void {
		if (this._tickInterval === null && this._queue.length > 0) {
			this._tickInterval = setInterval(this._tick.bind(this), 500);
		}
	}

	protected onInit(): void | Promise<void> {
		// NOP
	}

	protected onDispose() {
		// NOP
	}

	private async _tick(): Promise<void> {
		if (this._insideTick === true) { return; }
		this._insideTick = true;
		try {
			if (!this.hasSubscribers || this._queue.length === 0) {
				if (this._tickInterval !== null) {
					clearInterval(this._tickInterval);
					this._tickInterval = null;
				}
				return;
			}

			const message: Message = this._queue[0];
			try {
				const event: MessageBus.Channel.Event = {
					source: this,
					data: message
				};
				await this.notify(this.initExecutionContext, event);
				if (event.delivered === undefined) {
					throw new FExceptionInvalidOperation("Contract violation. Event consumer MUST set field 'delivered' to true/false explicitly.");
				}
				if (event.delivered === true) {
					this._queue.shift(); // OK, going to next message
				}
			} catch (e) {
				const ex: FException = FException.wrapIfNeeded(e);
				console.error(`Cannot deliver message '${message.messageId}' to subscriber '${this._subscriberId}'. ${ex.message}`);
			}
		} finally {
			this._insideTick = false;
		}
	}
}

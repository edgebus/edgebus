import { FException, FExceptionInvalidOperation } from "@freemework/common";

import { Message } from "../model/message";
import { Topic } from "../model/topic";
import { Subscriber } from "../model/subscriber";
import { EventChannelBase } from "../utils/event_channel_base";

import { MessageBus } from "./message_bus";

export class MessageBusLocalChannelSequence extends EventChannelBase<Message.Id & Message.Data, MessageBus.Channel.Event>
	implements MessageBus.Channel {
	private readonly _disposer: () => void | Promise<void>;
	private readonly _queue: Array<Message>;
	private readonly _topicName: Topic["topicName"];
	private readonly _subscriberId: Subscriber["subscriberId"];
	private _tickInterval: NodeJS.Timeout | null;
	private _insideTick: boolean;

	public constructor(
		topicName: Topic["topicName"],
		subscriberId: Subscriber["subscriberId"],
		queue: Array<Message>,
		disposer: () => void | Promise<void>,
	) {
		super();
		this._disposer = disposer;
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

	protected onDispose(): void | Promise<void> {
		return this._disposer();
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

import { FException, FExceptionInvalidOperation } from "@freemework/common";

import { Message } from "../model/message";
import { Topic } from "../model/topic";
import { Egress } from "../model/egress";
import { EventChannelBase } from "../utils/event_channel_base";

import { MessageBus } from "./message_bus";
import { EgressApiIdentifier } from "../misc/api-identifier";

export class MessageBusLocalChannelParallel extends EventChannelBase<Message.Id & Message.Data, MessageBus.Channel.Event>
	implements MessageBus.Channel {
	private readonly _disposer: () => void | Promise<void>;
	private readonly _queue: Array<Message>;
	private readonly _pendingQueue: Array<Message> = [];
	private readonly _topicName: Topic["topicName"];
	private readonly _subscriberId: EgressApiIdentifier;
	private _tickInterval: NodeJS.Timeout | null;
	private _insideTick: boolean;

	public constructor(
		topicName: Topic["topicName"],
		egressId: EgressApiIdentifier,
		queue: Array<Message>,
		disposer: () => void | Promise<void>,
	) {
		super();
		this._disposer = disposer;
		this._topicName = topicName;
		this._subscriberId = egressId;
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

			for (const msg of this._queue) {
				if (!this._pendingQueue.includes(msg)) {
					this.notifyWoBlcok(msg);
				}
			}

		} finally {
			this._insideTick = false;
		}
	}

	private async notifyWoBlcok(msg: Message) {
		try {
			this._pendingQueue.push(msg);
			const event: MessageBus.Channel.Event = {
				source: this,
				data: msg
			};
			await this.notify(this.initExecutionContext, event);
			if (event.delivered === undefined) {
				throw new FExceptionInvalidOperation("Contract violation. Event consumer MUST set field 'delivered' to true/false explicitly.");
			}
			if (event.delivered === true) {
				this._queue.splice(this._queue.indexOf(msg), 1); // OK, remove message from queue
			}
			this._pendingQueue.splice(this._pendingQueue.indexOf(msg), 1);
		} catch (e) {
			const ex: FException = FException.wrapIfNeeded(e);
			console.error(`Cannot deliver message '${msg.messageId}' to subscriber '${this._subscriberId}'. ${ex.message}`);
			this._pendingQueue.splice(this._pendingQueue.indexOf(msg), 1);
		}
	}
}

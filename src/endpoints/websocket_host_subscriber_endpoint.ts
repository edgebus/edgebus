import { FDisposableBase, FException, FExceptionAggregate, FExecutionContext } from "@freemework/common";
import { FHostingConfiguration, FWebServer, FWebSocketChannelFactoryEndpoint } from "@freemework/hosting";

import { EventEmitter } from "events";
import * as WebSocket from "ws";

import { MessageBus } from "../messaging/message_bus";
import { Message } from "../model/message";
import { Topic } from "../model/topic";
import { EventChannelBase } from "../utils/event_channel_base";

export class WebSocketHostSubscriberEndpoint extends FWebSocketChannelFactoryEndpoint {
	private readonly _emitter: EventEmitter;
	private readonly _textChannels: Array<TextChannel> = [];
	private readonly _channelsFactories: ReadonlyArray<MessageBus.ChannelFactory>;

	public constructor(
		servers: ReadonlyArray<FWebServer>,
		opts: WebSocketHostSubscriberEndpoint.Opts,
	) {
		super(servers, opts, { text: true });
		this._channelsFactories = opts.channelsFactories;
		this._emitter = new EventEmitter();
	}

	public get consumersCount(): number {
		return this._textChannels.length/* + this._binaryChannels.length*/;
	}

	public on(event: "firstConsumerAdded", listener: () => void): this;
	public on(event: "lastConsumerRemoved", listener: () => void): this;
	public on(event: "consumersCountChanged", listener: () => void): this;
	public on(event: string, listener: () => void): this {
		this._emitter.on(event, listener);
		return this;
	}

	protected override async createTextChannel(
		executionContext: FExecutionContext, webSocket: WebSocket, subProtocol: string
	): Promise<FWebSocketChannelFactoryEndpoint.TextChannel> {
		const channel: TextChannel = new TextChannel(this._channelsFactories, () => {
			const indexToDelete = this._textChannels.indexOf(channel);
			if (indexToDelete !== -1) {
				this._textChannels.splice(indexToDelete, 1);
				this._emitter.emit("consumersCountChanged");
			}
			if (this._textChannels.length === 0) {
				this._emitter.emit("lastConsumerRemoved");
			}
		});
		await channel.init(executionContext);

		this._textChannels.push(channel);
		this._emitter.emit("consumersCountChanged");
		if (this._textChannels.length === 1) {
			this._emitter.emit("firstConsumerAdded");
		}
		return channel;
	}
}

export namespace WebSocketHostSubscriberEndpoint {
	export interface Opts extends FHostingConfiguration.WebSocketEndpoint {
		readonly channelsFactories: ReadonlyArray<MessageBus.ChannelFactory>;
	}
}

class TextChannel extends EventChannelBase<string> implements FWebSocketChannelFactoryEndpoint.TextChannel {
	private readonly _channelsFactories: ReadonlyArray<MessageBus.ChannelFactory>;
	private _channels: ReadonlyArray<MessageBus.Channel> | null;
	private readonly _disposer: () => void | Promise<void>;
	private readonly _onMessageBound: MessageBus.Channel.Callback;

	public constructor(
		channelsFactories: ReadonlyArray<MessageBus.ChannelFactory>,
		disposer: () => void | Promise<void>,
	) {
		super();
		this._channelsFactories = channelsFactories;
		this._channels = null;
		this._disposer = disposer;
		this._onMessageBound = this._onMessage.bind(this);
	}

	public async send(executionContext: FExecutionContext, data: string): Promise<void> {
		// Echo any message from client
		return this.notify(executionContext, { data });
	}

	protected async onInit(): Promise<void> {
		const channels: Array<MessageBus.Channel> = [];
		try {
			for (const channelFactory of this._channelsFactories) {
				const channel: MessageBus.Channel = await channelFactory();
				channels.push(channel);
				channel.addHandler(this._onMessageBound);
			}
		} catch (e) {
			await FDisposableBase.disposeAll(...channels);
			throw e;
		}
		this._channels = Object.freeze(channels);
	}

	protected async onDispose(): Promise<void> {
		if (this._channels !== null) {
			for (const channel of this._channels) {
				await channel.dispose();
				channel.removeHandler(this._onMessageBound); // Prevent memory leaks
			}
			this._channels = null;
		}

		return this._disposer();
	}

	private async _onMessage(executionContext: FExecutionContext, event: MessageBus.Channel.Event): Promise<void> {
		try {
			const topicName: Topic["topicName"] = event.source.topicName;
			const message: Message.Id & Message.Data = event.data;

			await this._delivery(this.initExecutionContext, topicName, message);
			event.delivered = true;
		} catch (e) {
			event.delivered = false;
			console.error(e);
		}
	}

	private async _delivery(
		executionContext: FExecutionContext,
		topicName: Topic["topicName"],
		message: Message.Id & Message.Data
	): Promise<void> {
		const mediaType: string = message.mediaType;
		const messageBody: Buffer = message.messageBody;
		let data: any;
		switch (mediaType) {
			case "application/json":
				data = JSON.parse(messageBody.toString("utf8"));
				break;
			default:
				data = messageBody.toString("base64");
				break;
		}

		const messageStr = JSON.stringify({
			jsonrpc: "2.0",
			method: topicName,
			id: message.messageId,
			params: { mediaType, data }
		});

		await this.notify(executionContext, { data: messageStr });
	}
}

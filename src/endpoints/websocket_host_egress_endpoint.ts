import { FDisposableBase, FException, FExceptionAggregate, FExecutionContext, FLogger } from "@freemework/common";
import { FHostingConfiguration, FWebServer, FWebSocketChannelFactoryEndpoint } from "@freemework/hosting";

import { EventEmitter } from "events";
import * as WebSocket from "ws";

import { MessageBus } from "../messaging/message_bus";
import { Message } from "../model/message";
import { Topic } from "../model/topic";
import { EventChannelBase } from "../utils/event_channel_base";
import { Bind } from "../utils/bind";
import { EgressIdentifier } from "../model";

export class WebSocketHostEgressEndpoint extends FWebSocketChannelFactoryEndpoint {
	private readonly _logger: FLogger;
	private readonly _egressId: EgressIdentifier;
	private readonly _emitter: EventEmitter;
	private readonly _egressClientChannels: Array<TextChannel> = [];
	private readonly _channelsFactories: ReadonlyArray<MessageBus.ChannelFactory>;
	private _topicMessageChannels: ReadonlyArray<MessageBus.Channel> | null;

	public constructor(
		servers: ReadonlyArray<FWebServer>,
		egressId: EgressIdentifier,
		channelsFactories: ReadonlyArray<MessageBus.ChannelFactory>,
		opts: FHostingConfiguration.WebSocketEndpoint,
	) {
		super(servers, opts, { text: true });
		this._channelsFactories = channelsFactories;
		this._emitter = new EventEmitter();
		this._logger = FLogger.create(this.constructor.name);
		this._egressId = egressId;
		this._topicMessageChannels = null;
	}

	public get consumersCount(): number {
		return this._egressClientChannels.length/* + this._binaryChannels.length*/;
	}

	// public on(event: "firstConsumerAdded", listener: () => void): this;
	// public on(event: "lastConsumerRemoved", listener: () => void): this;
	// public on(event: "consumersCountChanged", listener: () => void): this;
	// public on(event: string, listener: () => void): this {
	// 	this._emitter.on(event, listener);
	// 	return this;
	// }

	protected override async createTextChannel(
		executionContext: FExecutionContext, webSocket: WebSocket, subProtocol: string
	): Promise<FWebSocketChannelFactoryEndpoint.TextChannel> {
		const channel: TextChannel = new TextChannel(
			// this._channelsFactories,
			async () => {
				// disposer
				const indexToDelete = this._egressClientChannels.indexOf(channel);
				if (indexToDelete !== -1) {
					this._egressClientChannels.splice(indexToDelete, 1);
					this._emitter.emit("consumersCountChanged");
				}
				if (this._egressClientChannels.length === 0) {
					this._emitter.emit("lastConsumerRemoved");
					await this._onLastConsumerRemoved();
				}
			},
			// this._logger
		);
		await channel.init(executionContext);

		this._egressClientChannels.push(channel);
		this._emitter.emit("consumersCountChanged");
		if (this._egressClientChannels.length === 1) {
			this._emitter.emit("firstConsumerAdded");
			await this._onFirstConsumerAdded();
		}
		return channel;
	}

	private async _onFirstConsumerAdded(): Promise<void> {
		const channels: Array<MessageBus.Channel> = [];
		try {
			for (const channelFactory of this._channelsFactories) {
				const channel: MessageBus.Channel = await channelFactory();
				channels.push(channel);
				channel.addHandler(this._onMessage);
			}
		} catch (e) {
			await FDisposableBase.disposeAll(...channels);
			throw e;
		}
		this._topicMessageChannels = Object.freeze(channels);
	}
	private async _onLastConsumerRemoved(): Promise<void> {
		if (this._topicMessageChannels !== null) {
			for (const channel of this._topicMessageChannels) {
				await channel.dispose();
				channel.removeHandler(this._onMessage); // Prevent memory leaks
			}
			this._topicMessageChannels = null;
		}
	}

	@Bind
	private async _onMessage(executionContext: FExecutionContext, event: MessageBus.Channel.Event): Promise<void> {
		const topicName: Topic["topicName"] = event.source.topicName;
		this._logger.debug(executionContext, () => `Got message from topic '${topicName}'`);
		const message: Message = event.data;
		const errors: Array<FException> = [];
		for (const egressClientChannel of this._egressClientChannels) {
			try {
				await egressClientChannel.delivery(
					// this.initExecutionContext, // TODO: Why do we using this.initExecutionContext instead executionContext?
					executionContext,
					topicName,
					message
				);
			} catch (e) {
				errors.push(FException.wrapIfNeeded(e));
			}
		}
		FExceptionAggregate.throwIfNeeded(errors);
	}
}

export namespace WebSocketHostSubscriberEndpoint {
}

class TextChannel extends EventChannelBase<string> implements FWebSocketChannelFactoryEndpoint.TextChannel {
	private readonly _disposer: () => void | Promise<void>;

	public constructor(
		disposer: () => void | Promise<void>,
	) {
		super();
		this._disposer = disposer;
	}

	public async send(executionContext: FExecutionContext, data: string): Promise<void> {
		// Echo any message from client
		return this.notify(executionContext, { data });
	}

	protected onInit(): void {
		// NOP
	}

	protected async onDispose(): Promise<void> {
		return await this._disposer();
	}

	public async delivery(
		executionContext: FExecutionContext,
		topicName: Topic["topicName"],
		message: Message
	): Promise<void> {
		const mediaType: string = message.messageMediaType;
		const messageBody: Buffer = Buffer.from(message.messageBody);
		let data: any = { rawBase64: messageBody.toString("base64") };
		switch (mediaType) {
			case "application/json":
				data.json = JSON.parse(messageBody.toString("utf8"));
				break;
		}

		const messageStr: string = JSON.stringify({
			jsonrpc: "2.0",
			method: topicName,
			id: message.messageId,
			params: {
				mediaType,
				headers: message.messageHeaders,
				data,
				labels: message.messageLabels.map(l => ({ id: l.labelId, value: l.labelValue }))
			}
		});

		await this.notify(executionContext, { data: messageStr });
	}
}

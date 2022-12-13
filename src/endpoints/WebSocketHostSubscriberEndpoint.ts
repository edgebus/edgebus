import { FCancellationToken, FLogger, FSubscriberChannelMixin, FExceptionAggregate, FException, FExecutionContext } from "@freemework/common";
import { FHostingConfiguration, FWebServer, FWebSocketChannelFactoryEndpoint } from "@freemework/hosting";

import { EventEmitter } from "events";
import * as WebSocket from "ws";

import { Message } from "../model/Message";
import { SubscriberChannelBase } from "../utils/SubscriberChannelBase";
import { Topic } from "../model/Topic";

export class WebSocketHostSubscriberEndpoint extends FWebSocketChannelFactoryEndpoint {
	private readonly _emitter: EventEmitter;
	//private readonly _binaryChannels: Array<BinaryChannel> = [];
	private readonly _textChannels: Array<TextChannel> = [];
	//private readonly _topicNames: ReadonlyArray<string>;

	public constructor(
		//topicNames: ReadonlyArray<string>,
		servers: ReadonlyArray<FWebServer>,
		opts: FHostingConfiguration.WebSocketEndpoint,
		log: FLogger
	) {
		super(servers, opts, { text: true });
		//this._topicNames = topicNames;
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

	// public async createBinaryChannel(
	// 	executionContext: FExecutionContext, webSocket: WebSocket, subProtocol: string
	// ): Promise<WebSocketChannelFactoryEndpoint.BinaryChannel> {
	// 	const channel = new BinaryChannel(() => {
	// 		const indexToDelete = this._binaryChannels.indexOf(channel);
	// 		if (indexToDelete !== -1) {
	// 			this._binaryChannels.splice(indexToDelete, 1);
	// 		}
	// 	});

	// 	this._binaryChannels.push(channel);

	// 	return channel;
	// }

	public async createTextChannel(
		executionContext: FExecutionContext, webSocket: WebSocket, subProtocol: string
	): Promise<FWebSocketChannelFactoryEndpoint.TextChannel> {
		const channel = new TextChannel(() => {
			const indexToDelete = this._textChannels.indexOf(channel);
			if (indexToDelete !== -1) {
				this._textChannels.splice(indexToDelete, 1);
				this._emitter.emit("consumersCountChanged");
			}
			if (this._textChannels.length === 0) {
				this._emitter.emit("lastConsumerRemoved");
			}
		});

		this._textChannels.push(channel);
		this._emitter.emit("consumersCountChanged");
		if (this._textChannels.length === 1) {
			this._emitter.emit("firstConsumerAdded");
		}
		return channel;
	}


	public async delivery(
		executionContext: FExecutionContext, topicName: Topic["topicName"], message: Message.Id & Message.Data
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

		const textChannelDeliveryErrors: Array<FException> = [];
		for (const textChannel of this._textChannels) {
			try {
				await textChannel.rpcDelivery(executionContext, messageStr);
			} catch (e) {
				textChannelDeliveryErrors.push(FException.wrapIfNeeded(e));
			}
		}
		if (textChannelDeliveryErrors.length > 0) { throw new FExceptionAggregate(textChannelDeliveryErrors); }

		// if (this._binaryChannels.length > 0) {
		// 	const messageBinary = Buffer.from(messageStr);
		// 	for (const binaryChannel of this._binaryChannels) {
		// 		await binaryChannel.delivery(messageBinary);
		// 	}
		// }
	}
}

class TextChannel extends SubscriberChannelBase<string> implements FWebSocketChannelFactoryEndpoint.TextChannel {
	private readonly _disposer: () => void | Promise<void>;

	public constructor(disposer: () => void | Promise<void>) {
		super();
		this._disposer = disposer;
	}

	public async send(executionContext: FExecutionContext, data: string): Promise<void> {
		// Echo any message from client
		return this.notify(executionContext, { data });
	}

	public async rpcDelivery(executionContext: FExecutionContext, messageStr: string) {
		await this.notify(executionContext, { data: messageStr });
		// TODO wait for deliver ACK message
	}

	protected onInit(): void | Promise<void> {
		// NOP
	}

	protected onDispose(): void | Promise<void> {
		return this._disposer();
	}
}

// class BinaryChannel extends SubscriberChannelBase<Uint8Array> implements WebSocketChannelFactoryEndpoint.BinaryChannel {
// 	private readonly _disposer: () => void | Promise<void>;

// 	public constructor(disposer: () => void | Promise<void>) {
// 		super();
// 		this._disposer = disposer;
// 	}

// 	public async send(executionContext: FExecutionContext, data: Uint8Array): Promise<void> {
// 		// Echo any message from client
// 		return this.notify({ data });
// 	}

// 	public delivery(messageBinary: Uint8Array) {
// 		return this.notify({ data: messageBinary });
// 	}

// 	protected onDispose(): void | Promise<void> {
// 		return this._disposer();
// 	}
// }

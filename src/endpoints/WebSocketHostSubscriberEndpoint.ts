import { CancellationToken, Logger } from "@zxteam/contract";
import { Configuration as HostingConfiguration, WebServer, WebSocketChannelFactoryEndpoint } from "@zxteam/hosting";

import { EventEmitter } from "events";
import * as WebSocket from "ws";

import { Message } from "../model/Message";
import { SubscriberChannelBase } from "../utils/SubscriberChannelBase";

export class WebSocketHostSubscriberEndpoint extends WebSocketChannelFactoryEndpoint {
	private readonly _emmiter: EventEmitter;
	//private readonly _binaryChannels: Array<BinaryChannel> = [];
	private readonly _textChannels: Array<TextChannel> = [];
	private readonly _topicName: string;

	public constructor(
		topicName: string,
		servers: ReadonlyArray<WebServer>,
		opts: HostingConfiguration.WebSocketEndpoint,
		log: Logger
	) {
		super(servers, opts, log, { text: true });
		this._topicName = topicName;
		this._emmiter = new EventEmitter();
	}

	public get consumersCount(): number {
		return this._textChannels.length/* + this._binaryChannels.length*/;
	}

	public on(event: "consumersCountChanged", listener: () => void): this {
		this._emmiter.on(event, listener);
		return this;
	}

	// public async createBinaryChannel(
	// 	cancellationToken: CancellationToken, webSocket: WebSocket, subProtocol: string
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
		cancellationToken: CancellationToken, webSocket: WebSocket, subProtocol: string
	): Promise<WebSocketChannelFactoryEndpoint.TextChannel> {
		const channel = new TextChannel(() => {
			const indexToDelete = this._textChannels.indexOf(channel);
			if (indexToDelete !== -1) {
				this._textChannels.splice(indexToDelete, 1);
				this._emmiter.emit("consumersCountChanged");
			}
		});

		this._textChannels.push(channel);
		this._emmiter.emit("consumersCountChanged");

		return channel;
	}


	public async delivery(cancellationToken: CancellationToken, message: Message.Id & Message.Data): Promise<void> {
		const messageStr = JSON.stringify({
			jsonrpc: "2.0",
			method: this._topicName,
			id: message.messageId,
			params: {
				mediaType: message.mediaType,
				data: message.messageBody.toString("base64")
			}
		});
		for (const textChannel of this._textChannels) {
			await textChannel.rpcDelivery(messageStr);
		}
		// if (this._binaryChannels.length > 0) {
		// 	const messageBinary = Buffer.from(messageStr);
		// 	for (const binaryChannel of this._binaryChannels) {
		// 		await binaryChannel.delivery(messageBinary);
		// 	}
		// }
	}
}

class TextChannel extends SubscriberChannelBase<string> implements WebSocketChannelFactoryEndpoint.TextChannel {
	private readonly _disposer: () => void | Promise<void>;

	public constructor(disposer: () => void | Promise<void>) {
		super();
		this._disposer = disposer;
	}

	public async send(cancellationToken: CancellationToken, data: string): Promise<void> {
		// Echo any message from client
		return this.notify({ data });
	}

	public async rpcDelivery(messageStr: string) {
		await this.notify({ data: messageStr });
		// TODO wait for deliver ACK message
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

// 	public async send(cancellationToken: CancellationToken, data: Uint8Array): Promise<void> {
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

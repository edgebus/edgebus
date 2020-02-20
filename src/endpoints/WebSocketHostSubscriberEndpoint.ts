import { CancellationToken, Logger } from "@zxteam/contract";
import { SubscriberChannelMixin } from "@zxteam/channels";
import { Configuration as HostingConfiguration, WebServer, WebSocketChannelFactoryEndpoint } from "@zxteam/hosting";

import { EventEmitter } from "events";
import * as WebSocket from "ws";

import { Message } from "../model/Message";
import { SubscriberChannelBase } from "../utils/SubscriberChannelBase";
import { Topic } from "../model/Topic";
import { wrapErrorIfNeeded, AggregateError } from "@zxteam/errors";

export class WebSocketHostSubscriberEndpoint extends WebSocketChannelFactoryEndpoint {
	private readonly _emmiter: EventEmitter;
	//private readonly _binaryChannels: Array<BinaryChannel> = [];
	private readonly _textChannels: Array<TextChannel> = [];
	//private readonly _topicNames: ReadonlyArray<string>;

	public constructor(
		//topicNames: ReadonlyArray<string>,
		servers: ReadonlyArray<WebServer>,
		opts: HostingConfiguration.WebSocketEndpoint,
		log: Logger
	) {
		super(servers, opts, log, { text: true });
		//this._topicNames = topicNames;
		this._emmiter = new EventEmitter();
	}

	public get consumersCount(): number {
		return this._textChannels.length/* + this._binaryChannels.length*/;
	}

	public on(event: "firstConsumerAdded", listener: () => void): this;
	public on(event: "lastConsumerRemoved", listener: () => void): this;
	public on(event: "consumersCountChanged", listener: () => void): this;
	public on(event: string, listener: () => void): this {
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
			if (this._textChannels.length === 0) {
				this._emmiter.emit("lastConsumerRemoved");
			}
		});

		this._textChannels.push(channel);
		this._emmiter.emit("consumersCountChanged");
		if (this._textChannels.length === 1) {
			this._emmiter.emit("firstConsumerAdded");
		}
		return channel;
	}


	public async delivery(
		cancellationToken: CancellationToken, topicName: Topic["topicName"], message: Message.Id & Message.Data
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

		const textChannelDeliveryErrors: Array<Error> = [];
		for (const textChannel of this._textChannels) {
			try {
				await textChannel.rpcDelivery(cancellationToken, messageStr);
			} catch (e) {
				textChannelDeliveryErrors.push(wrapErrorIfNeeded(e));
			}
		}
		if (textChannelDeliveryErrors.length > 0) { throw new AggregateError(textChannelDeliveryErrors); }

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

	public async rpcDelivery(cancellationToken: CancellationToken, messageStr: string) {
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

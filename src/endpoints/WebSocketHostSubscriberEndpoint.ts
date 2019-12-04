import { CancellationToken, Logger } from "@zxteam/contract";
import { Configuration as HostingConfiguration, WebServer, WebSocketChannelFactoryEndpoint } from "@zxteam/hosting";

import * as WebSocket from "ws";

import { Message } from "../model/Message";
import { SubscriberChannelBase } from "../utils/SubscriberChannelBase";

export class WebSocketHostSubscriberEndpoint extends WebSocketChannelFactoryEndpoint {
	//private readonly _binaryChannels: Array<BinaryChannel> = [];
	private readonly _textChannels: Array<TextChannel> = [];

	public constructor(
		servers: ReadonlyArray<WebServer>,
		opts: HostingConfiguration.WebSocketEndpoint,
		log: Logger
	) {
		super(servers, opts, log, { text: true });
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
			}
		});

		this._textChannels.push(channel);

		return channel;
	}


	public async delivery(cancellationToken: CancellationToken, message: Message.Id & Message.Data): Promise<void> {
		const messageStr = JSON.stringify({
			messageId: message.messageId,
			mediaType: message.mediaType,
			messageBody: message.messageBody.toString("base64")
		});
		for (const textChannel of this._textChannels) {
			await textChannel.delivery(messageStr);
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

	public delivery(messageStr: string) {
		return this.notify({ data: messageStr });
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

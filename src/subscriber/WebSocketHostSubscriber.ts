import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { Configuration as HostingConfiguration, WebServer, WebSocketChannelFactoryEndpoint } from "@zxteam/hosting";

import * as uuid from "uuid";

import { MessageBus } from "../messaging/MessageBus";
import { WebSocketHostSubscriberEndpoint } from "../endpoints/WebSocketHostSubscriberEndpoint";
import { Subscriber } from "../model/Subscriber";
import { InvalidOperationError, ArgumentError } from "@zxteam/errors";
import { DUMMY_CANCELLATION_TOKEN } from "@zxteam/cancellation";

export class WebSocketHostSubscriber extends Initable {

	private readonly _webSocketHostSubscriberEndpoint: WebSocketHostSubscriberEndpoint;
	private readonly _messagesChannel: MessageBus.Channel;

	public constructor(messagesChannel: MessageBus.Channel, opts: WebSocketHostSubscriber.Opts) {
		super();

		this._messagesChannel = messagesChannel;

		let baseBindPath = opts.baseBindPath;
		while (baseBindPath.length > 0 && baseBindPath.endsWith("/")) {
			baseBindPath = baseBindPath.slice(0, -1);
		}

		const [prefix, kind, id] = opts.subscriberId.split(".");

		if (prefix !== "subscriber") {
			throw new ArgumentError("opts.subscriberId", `Wrong subscriberId prefix: '${prefix}'. Expected: 'subscriber'`);
		}
		if (kind !== "websockethost") {
			throw new ArgumentError("opts.subscriberId", `Wrong subscriberId kind: '${kind}'. Expected: 'websockethost'`);
		}

		// TODO validate "id" for UUID

		const bindPath = `${baseBindPath}/websockethost/${id}`;

		this._webSocketHostSubscriberEndpoint = new WebSocketHostSubscriberEndpoint(
			opts.bindServers,
			{
				allowedProtocols: ["json-rpc"],
				defaultProtocol: "json-rpc",
				bindPath
			},
			opts.log
		);
	}

	protected async onInit(cancellationToken: CancellationToken): Promise<void> {
		await this._webSocketHostSubscriberEndpoint.init(cancellationToken);

		this._messagesChannel.addHandler(this._onMessage.bind(this));
	}
	protected async onDispose(): Promise<void> {
		await this._webSocketHostSubscriberEndpoint.dispose();
	}

	private async _onMessage(event: MessageBus.Channel.Event | Error): Promise<void> {
		//
		if (event instanceof Error) {
			//
			console.error(event); // TODO something
			return;
		}

		this._webSocketHostSubscriberEndpoint.delivery(DUMMY_CANCELLATION_TOKEN, event.data).catch(console.error);
	}
}

export namespace WebSocketHostSubscriber {
	export interface Opts {
		readonly subscriberId: Subscriber["subscriberId"];
		readonly bindServers: ReadonlyArray<WebServer>;
		readonly baseBindPath: string;
		readonly log: Logger;
	}
}

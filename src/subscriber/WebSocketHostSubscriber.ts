import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { Configuration as HostingConfiguration, WebServer, WebSocketChannelFactoryEndpoint } from "@zxteam/hosting";

import * as uuid from "uuid";

import { MessageBus } from "../messaging/MessageBus";
import { WebSocketHostSubscriberEndpoint } from "../endpoints/WebSocketHostSubscriberEndpoint";
import { Subscriber } from "../model/Subscriber";
import { InvalidOperationError, ArgumentError } from "@zxteam/errors";
import { DUMMY_CANCELLATION_TOKEN } from "@zxteam/cancellation";
import { Message } from "../model/Message";
import { Topic } from "../model/Topic";

export class WebSocketHostSubscriber extends Initable {

	private readonly _webSocketHostSubscriberEndpoint: WebSocketHostSubscriberEndpoint;
	private readonly _channels: ReadonlyArray<MessageBus.Channel>;

	public constructor(opts: WebSocketHostSubscriber.Opts, ...channels: ReadonlyArray<MessageBus.Channel>) {
		super();

		this._channels = channels;

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
			//messagesChannel.topicName,
			opts.bindServers,
			{
				allowedProtocols: ["jsonrpc"],
				defaultProtocol: "jsonrpc",
				bindPath
			},
			opts.log
		);

		const onMessageBound = this._onMessage.bind(this);

		this._webSocketHostSubscriberEndpoint.on("firstConsumerAdded", () => {
			this._channels.forEach(channel => {
				channel.addHandler(onMessageBound);
				channel.wakeUp();
			});
		});
		this._webSocketHostSubscriberEndpoint.on("lastConsumerRemoved", () => {
			this._channels.forEach(channel => channel.removeHandler(onMessageBound));
		});
	}

	protected async onInit(cancellationToken: CancellationToken): Promise<void> {
		await this._webSocketHostSubscriberEndpoint.init(cancellationToken);
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

		try {
			if (this._webSocketHostSubscriberEndpoint.consumersCount === 0) {
				event.delivered = false;
				return;
			}

			const topicName: Topic["topicName"] = event.source.topicName;
			const message: Message.Id & Message.Data = event.data;

			await this._webSocketHostSubscriberEndpoint.delivery(DUMMY_CANCELLATION_TOKEN, topicName, message);
			event.delivered = true;
		} catch (e) {
			event.delivered = false;
			console.error(e);
		}
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

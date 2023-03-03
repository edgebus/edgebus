import { FExceptionArgument, FExecutionContext, FInitableBase, FLogger } from "@freemework/common";
import { FWebServer } from "@freemework/hosting";

import { WebSocketHostSubscriberEndpoint } from "../endpoints/web_socket_host_subscriber_endpoint";
import { MessageBus } from "../messaging/message_bus";
import { Message } from "../model/message";
import { Subscriber } from "../model/subscriber";
import { Topic } from "../model/topic";

export class WebSocketHostSubscriber extends FInitableBase {

	private readonly _webSocketHostSubscriberEndpoint: WebSocketHostSubscriberEndpoint;
	private readonly _channels: ReadonlyArray<MessageBus.Channel>;

	public constructor(
		opts: WebSocketHostSubscriber.Opts,
		private readonly _log: FLogger,
		...channels: ReadonlyArray<MessageBus.Channel>
	) {
		super();

		this._channels = channels;

		let baseBindPath = opts.baseBindPath;
		while (baseBindPath.length > 0 && baseBindPath.endsWith("/")) {
			baseBindPath = baseBindPath.slice(0, -1);
		}

		const [prefix, kind, id] = opts.subscriberId.split(".");

		if (prefix !== "subscriber") {
			throw new FExceptionArgument(`Wrong subscriberId prefix: '${prefix}'. Expected: 'subscriber'`, "opts.subscriberId");
		}
		if (kind !== "websockethost") {
			throw new FExceptionArgument(`Wrong subscriberId kind: '${kind}'. Expected: 'websockethost'`, "opts.subscriberId");
		}

		// TODO validate "id" for UUID

		const bindPath = `${baseBindPath}/websockethost/${id}`;

		this._log.debug(FExecutionContext.Empty, `Construct ${WebSocketHostSubscriber.name} with bind path '${bindPath}'.`);

		this._webSocketHostSubscriberEndpoint = new WebSocketHostSubscriberEndpoint(
			//messagesChannel.topicName,
			opts.bindServers,
			{
				allowedProtocols: ["jsonrpc"],
				defaultProtocol: "jsonrpc",
				bindPath
			},
			FLogger.create(_log.name + WebSocketHostSubscriberEndpoint.name)
		);

		const onMessageBound: MessageBus.Channel.Callback = this._onMessage.bind(this);

		this._webSocketHostSubscriberEndpoint.on("firstConsumerAdded", () => {
			this._channels.forEach(channel => {
				channel.addHandler(onMessageBound);
			});
		});
		this._webSocketHostSubscriberEndpoint.on("lastConsumerRemoved", () => {
			this._channels.forEach(channel => channel.removeHandler(onMessageBound));
		});
	}

	protected async onInit(): Promise<void> {
		await this._webSocketHostSubscriberEndpoint.init(this.initExecutionContext);
	}
	protected async onDispose(): Promise<void> {
		await this._webSocketHostSubscriberEndpoint.dispose();
	}

	private async _onMessage(executionContext: FExecutionContext, event: MessageBus.Channel.Event): Promise<void> {
		try {
			if (this._webSocketHostSubscriberEndpoint.consumersCount === 0) {
				event.delivered = false;
				return;
			}

			const topicName: Topic["topicName"] = event.source.topicName;
			const message: Message.Id & Message.Data = event.data;

			await this._webSocketHostSubscriberEndpoint.delivery(this.initExecutionContext, topicName, message);
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
		readonly bindServers: ReadonlyArray<FWebServer>;
		readonly baseBindPath: string;
	}
}

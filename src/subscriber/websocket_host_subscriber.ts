import { FExceptionArgument, FExecutionContext, FInitableBase, FLogger } from "@freemework/common";
import { FWebServer } from "@freemework/hosting";

import { WebSocketHostSubscriberEndpoint } from "../endpoints/websocket_host_subscriber_endpoint";
import { MessageBus } from "../messaging/message_bus";
import { Message } from "../model/message";
import { Subscriber } from "../model/subscriber";
import { Topic } from "../model/topic";

export class WebSocketHostSubscriber extends FInitableBase {

	private readonly _webSocketHostSubscriberEndpoint: WebSocketHostSubscriberEndpoint;

	public constructor(
		opts: WebSocketHostSubscriber.Opts,
		private readonly _log: FLogger,
	) {
		super();

		let baseBindPath = opts.baseBindPath;
		while (baseBindPath.length > 0 && baseBindPath.endsWith("/")) {
			baseBindPath = baseBindPath.slice(0, -1);
		}

		const [prefix, kind, id] = opts.subscriberId.split(".");

		if (prefix !== "subscriber") {
			throw new FExceptionArgument(`Wrong subscriberId prefix: '${prefix}'. Expected: 'subscriber'`, "opts.subscriberId");
		}
		if (kind !== "websocket_host") {
			throw new FExceptionArgument(`Wrong subscriberId kind: '${kind}'. Expected: 'websocket_host'`, "opts.subscriberId");
		}

		// TODO validate "id" for UUID

		const bindPath = `${baseBindPath}/websocket_host/${id}`;

		this._log.debug(FExecutionContext.Empty, `Construct ${WebSocketHostSubscriber.name} with bind path '${bindPath}'.`);

		this._webSocketHostSubscriberEndpoint = new WebSocketHostSubscriberEndpoint(
			opts.bindServers,
			{
				allowedProtocols: ["jsonrpc"],
				defaultProtocol: "jsonrpc",
				bindPath,
				channelsFactories: opts.channelFactories
			}
		);
	}

	protected async onInit(): Promise<void> {
		await this._webSocketHostSubscriberEndpoint.init(this.initExecutionContext);
	}
	protected async onDispose(): Promise<void> {
		await this._webSocketHostSubscriberEndpoint.dispose();
	}
}

export namespace WebSocketHostSubscriber {
	export interface Opts {
		readonly subscriberId: Subscriber["subscriberId"];
		readonly bindServers: ReadonlyArray<FWebServer>;
		readonly baseBindPath: string;
		readonly channelFactories: ReadonlyArray<MessageBus.ChannelFactory>;
	}
}

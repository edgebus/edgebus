import { FExceptionArgument, FExecutionContext, FInitableBase, FLogger } from "@freemework/common";
import { FWebServer } from "@freemework/hosting";

import { WebSocketHostSubscriberEndpoint } from "../endpoints/websocket_host_subscriber_endpoint";
import { MessageBus } from "../messaging/message_bus";
import { Message } from "../model/message";
import { Egress } from "../model/egress";
import { Topic } from "../model/topic";
import { EgressApiIdentifier } from "../misc/api-identifier";

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
		const bindPath = `${baseBindPath}/websocket_host/${opts.egressId.value}`;

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
		readonly egressId: EgressApiIdentifier;
		readonly bindServers: ReadonlyArray<FWebServer>;
		readonly baseBindPath: string;
		readonly channelFactories: ReadonlyArray<MessageBus.ChannelFactory>;
	}
}

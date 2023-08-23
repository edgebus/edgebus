import { FExceptionArgument, FExecutionContext, FInitableBase, FLogger, FLoggerLabelsExecutionContext } from "@freemework/common";
import { FWebServer } from "@freemework/hosting";

import { WebSocketHostEgressEndpoint } from "../endpoints/websocket_host_egress_endpoint";
import { MessageBus } from "../messaging/message_bus";
import { EgressIdentifier } from "../model";

export class WebSocketHostEgress extends FInitableBase {
	public constructor(opts: WebSocketHostEgress.Opts) {
		super();

		this._egressId = opts.egressId;

		let baseBindPath = opts.baseBindPath;
		while (baseBindPath.length > 0 && baseBindPath.endsWith("/")) {
			baseBindPath = baseBindPath.slice(0, -1);
		}
		const bindPath = `${baseBindPath}/websocket_host/${opts.egressId.value}`;
		this._webSocketHostSubscriberEndpoint = new WebSocketHostEgressEndpoint(
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
		const executionContext: FExecutionContext = new FLoggerLabelsExecutionContext(
			this.initExecutionContext,
			{
				egressId: this._egressId.value,
			}
		);

		await this._webSocketHostSubscriberEndpoint.init(executionContext);
	}
	protected async onDispose(): Promise<void> {
		await this._webSocketHostSubscriberEndpoint.dispose();
	}

	private readonly _egressId: EgressIdentifier;
	private readonly _webSocketHostSubscriberEndpoint: WebSocketHostEgressEndpoint;
}

export namespace WebSocketHostEgress {
	export interface Opts {
		readonly egressId: EgressIdentifier;
		readonly bindServers: ReadonlyArray<FWebServer>;
		readonly baseBindPath: string;
		readonly channelFactories: ReadonlyArray<MessageBus.ChannelFactory>;
	}
}

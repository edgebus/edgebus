import { FHostingConfiguration, FServersBindEndpoint, FWebServer } from "@freemework/hosting";

import { HttpHostIngress } from "../ingress/http_host.ingress";
import { IngressIdentifier, Topic } from "../model";
import { MessageBus } from "../messaging/message_bus";

export class IngressEndpoint extends FServersBindEndpoint {
	private readonly _httpHostIngress: HttpHostIngress;

	public constructor(
		servers: ReadonlyArray<FWebServer>,
		opts: FHostingConfiguration.BindEndpoint,
		httpHostIngressOpts: {
			topic: Topic.Id & Topic.Name & Topic.Data;
			ingressId: IngressIdentifier;
			messageBus: MessageBus;
			opts: HttpHostIngress.Opts;
		}
	) {
		super(servers, opts);

		this._httpHostIngress = new HttpHostIngress(
			httpHostIngressOpts.topic,
			httpHostIngressOpts.ingressId,
			httpHostIngressOpts.messageBus,
			httpHostIngressOpts.opts,
		);
	}

	protected async onInit(): Promise<void> {
		await super.onInit();
		try {
			for (const server of this._servers) {
				server.rootExpressApplication.use(
					this._bindPath ?? "/",
					this._httpHostIngress.router
				);
			}

			await this._httpHostIngress.init(this.initExecutionContext);
		}
		catch (e) {
			await super.onDispose();
			throw e;
		}
	}

	protected async onDispose(): Promise<void> {
		try {
			await this._httpHostIngress.dispose();
		} catch (e) {
			// this.log.
		}

		await super.onDispose();
	}
}

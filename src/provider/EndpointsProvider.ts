import { Logger, CancellationToken } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { Inject, Provides, Singleton } from "@zxteam/launcher";
import { logger } from "@zxteam/logger";
import * as hosting from "@zxteam/hosting";

import * as _ from "lodash";

import { Configuration, ConfigurationError } from "../Configuration";

// Providers
import { ConfigurationProvider } from "./ConfigurationProvider";
import { HostingProvider } from "./HostingProvider";
import { ApiProvider } from "./ApiProvider";

// Endpoints
import { ManagementApiRestEndpoint } from "../endpoints/ManagementApiRestEndpoint";
import { PublisherApiRestEndpoint } from "../endpoints/PublisherApiRestEndpoint";
import { SubscriberApiRestEndpoint } from "../endpoints/SubscriberApiRestEndpoint";
import { WebSocketHostSubscriberEndpoint } from "../endpoints/WebSocketHostSubscriberEndpoint";

@Singleton
export abstract class EndpointsProvider extends Initable {
	protected readonly log: Logger;

	public constructor() {
		super();
		this.log = logger.getLogger("Endpoints");
		if (this.log.isDebugEnabled) {
			this.log.debug(`Implementation: ${this.constructor.name}`);
		}
	}

	public abstract get publisherApiRestEndpoints(): ReadonlyArray<PublisherApiRestEndpoint>;
	public abstract get subscriberApiRestEndpoints(): ReadonlyArray<SubscriberApiRestEndpoint>;
}

@Provides(EndpointsProvider)
class EndpointsProviderImpl extends EndpointsProvider {
	@Inject
	public readonly configProvider!: ConfigurationProvider;

	@Inject
	private readonly _apiProvider!: ApiProvider;

	@Inject
	private readonly _hostingProvider!: HostingProvider;

	private readonly _endpointInstances: Array<Initable>;
	private readonly _destroyHandlers: Array<() => Promise<void>>;
	private readonly _publisherApiRestEndpoints: ReadonlyArray<PublisherApiRestEndpoint>;
	private readonly _subscriberApiRestEndpoints: ReadonlyArray<SubscriberApiRestEndpoint>;

	public constructor() {
		super();

		this.log.info("Constructing endpoints...");
		this._endpointInstances = [];

		const publisherApiRestEndpoints: Array<PublisherApiRestEndpoint> = [];
		const subscriberApiRestEndpoints: Array<SubscriberApiRestEndpoint> = [];

		for (const endpoint of this.configProvider.endpoints) {

			if (endpoint.type === "express-router-management" || endpoint.type === "express-router-publisher") {
				throw new Error("Not supported yet");
			}

			const serversMap: Map<HostingProvider.ServerInstance["name"], HostingProvider.ServerInstance> = new Map();
			this._hostingProvider.serverInstances.forEach(s => serversMap.set(s.name, s));

			const endpointServers: Array<hosting.WebServer> = [];
			for (const bindServer of endpoint.servers) {
				const serverInstance: HostingProvider.ServerInstance | undefined = serversMap.get(bindServer);
				if (serverInstance === undefined) {
					throw new ConfigurationError(`Cannot bind an endpoint '${endpoint.type}' to a server '${bindServer}'. The server is not defined.`);
				}
				endpointServers.push(serverInstance.server);
			}

			switch (endpoint.type) {
				case "rest-management": {
					const friendlyEndpoint: Configuration.RestManagementEndpoint = endpoint;
					const endpointInstance = new ManagementApiRestEndpoint(
						endpointServers, this._apiProvider.managementApi, endpoint,
						this.log.getLogger(friendlyEndpoint.type + " " + friendlyEndpoint.bindPath)
					);
					this._endpointInstances.push(endpointInstance);
					break;
				}
				case "rest-publisher": {
					const friendlyEndpoint: Configuration.RestPublisherEndpoint = endpoint;
					const endpointInstance = new PublisherApiRestEndpoint(
						endpointServers, this._apiProvider.publisherApi, endpoint,
						this.log.getLogger(friendlyEndpoint.type + " " + friendlyEndpoint.bindPath)
					);
					this._endpointInstances.push(endpointInstance);
					publisherApiRestEndpoints.push(endpointInstance);
					break;
				}
				case "rest-subscriber": {
					const friendlyEndpoint: Configuration.RestSubscriberEndpoint = endpoint;
					const endpointInstance = new SubscriberApiRestEndpoint(
						endpointServers, this._apiProvider.subscriberApi, endpoint,
						this.log.getLogger(friendlyEndpoint.type + " " + friendlyEndpoint.bindPath)
					);
					this._endpointInstances.push(endpointInstance);
					subscriberApiRestEndpoints.push(endpointInstance);
					break;
				}
				default:
					throw new UnreachableEndpointError(endpoint);
			}
		}

		this._destroyHandlers = [];

		this._publisherApiRestEndpoints = Object.freeze(publisherApiRestEndpoints);
		this._subscriberApiRestEndpoints = Object.freeze(subscriberApiRestEndpoints);
	}

	public get publisherApiRestEndpoints(): ReadonlyArray<PublisherApiRestEndpoint> {
		return this._publisherApiRestEndpoints;
	}

	public get subscriberApiRestEndpoints(): ReadonlyArray<SubscriberApiRestEndpoint> {
		return this._subscriberApiRestEndpoints;
	}

	protected async onInit(cancellationToken: CancellationToken): Promise<void> {
		this.log.info("Initializing endpoints...");
		try {
			for (const endpointInstance of this._endpointInstances) {
				await endpointInstance.init(cancellationToken);
				this._destroyHandlers.push(() => endpointInstance.dispose());
			}
		} catch (e) {
			let destroyHandler;
			while ((destroyHandler = this._destroyHandlers.pop()) !== undefined) {
				await destroyHandler();
			}
			throw e;
		}
	}

	protected async onDispose(): Promise<void> {
		this.log.info("Destroying endpoints...");
		let destroyHandler;
		while ((destroyHandler = this._destroyHandlers.pop()) !== undefined) {
			await destroyHandler();
		}
	}
}

class UnreachableEndpointError extends Error {
	public constructor(endpoint: never) {
		super(`Not supported endpoint: ${JSON.stringify(endpoint)}`);
	}
}

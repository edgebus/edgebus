import { FExecutionContext, FInitable, FInitableBase, FLogger } from "@freemework/common";
import { FWebServer } from "@freemework/hosting";

import { Container, Provides, Singleton } from "typescript-ioc";

import * as _ from "lodash";

import { Configuration, ConfigurationException } from "../Configuration";

// Providers
import { ConfigurationProvider } from "./ConfigurationProvider";
import { HostingProvider } from "./HostingProvider";
import { ApiProvider } from "./ApiProvider";

// Endpoints
import { ManagementApiRestEndpoint } from "../endpoints/ManagementApiRestEndpoint";
import { PublisherApiRestEndpoint } from "../endpoints/PublisherApiRestEndpoint";
import { SubscriberApiRestEndpoint } from "../endpoints/SubscriberApiRestEndpoint";
import { WebSocketHostSubscriberEndpoint } from "../endpoints/WebSocketHostSubscriberEndpoint";
import { InfoRestEndpoint } from "../endpoints/InfoRestEndpoint";

@Singleton
export abstract class EndpointsProvider extends FInitableBase {
	protected readonly log: FLogger;

	public constructor() {
		super();
		this.log = FLogger.create("Endpoints");
		if (this.log.isDebugEnabled) {
			this.log.debug(FExecutionContext.Empty, `Implementation: ${this.constructor.name}`);
		}
	}

	public abstract get publisherApiRestEndpoints(): ReadonlyArray<PublisherApiRestEndpoint>;
	public abstract get subscriberApiRestEndpoints(): ReadonlyArray<SubscriberApiRestEndpoint>;
}

@Provides(EndpointsProvider)
class EndpointsProviderImpl extends EndpointsProvider {
	// Do not use Inject inside providers to prevents circular dependency
	private readonly _configProvider: ConfigurationProvider;
	private readonly _apiProvider: ApiProvider;
	private readonly _hostingProvider: HostingProvider;

	private readonly _endpointInstances: Array<FInitable>;
	private readonly _destroyHandlers: Array<() => Promise<void>>;
	private readonly _publisherApiRestEndpoints: ReadonlyArray<PublisherApiRestEndpoint>;
	private readonly _subscriberApiRestEndpoints: ReadonlyArray<SubscriberApiRestEndpoint>;

	public constructor() {
		super();

		this.log.info(FExecutionContext.Empty, "Constructing endpoints...");

		this._hostingProvider = Container.get(HostingProvider);
		this._configProvider = Container.get(ConfigurationProvider);
		this._apiProvider = Container.get(ApiProvider);

		this._endpointInstances = [];

		const publisherApiRestEndpoints: Array<PublisherApiRestEndpoint> = [];
		const subscriberApiRestEndpoints: Array<SubscriberApiRestEndpoint> = [];

		for (const endpoint of this._configProvider.endpoints) {

			if (endpoint.type === "express-router-management" || endpoint.type === "express-router-publisher") {
				throw new Error("Not supported yet");
			}

			const serversMap: Map<HostingProvider.ServerInstance["name"], HostingProvider.ServerInstance> = new Map();
			this._hostingProvider.serverInstances.forEach(s => serversMap.set(s.name, s));

			const endpointServers: Array<FWebServer> = [];
			for (const bindServer of endpoint.servers) {
				const serverInstance: HostingProvider.ServerInstance | undefined = serversMap.get(bindServer);
				if (serverInstance === undefined) {
					throw new ConfigurationException(`Cannot bind an endpoint '${endpoint.type}' to a server '${bindServer}'. The server is not defined.`);
				}
				endpointServers.push(serverInstance.server);
			}

			switch (endpoint.type) {
				case "rest-info": {
					const friendlyEndpoint: Configuration.RestInfoEndpoint = endpoint;
					const endpointInstance = new InfoRestEndpoint(
						endpointServers, endpoint,
						FLogger.create(this.log.name + friendlyEndpoint.type + " " + friendlyEndpoint.bindPath)
					);
					this._endpointInstances.push(endpointInstance);
					break;
				}
				case "rest-management": {
					const friendlyEndpoint: Configuration.RestManagementEndpoint = endpoint;
					const endpointInstance = new ManagementApiRestEndpoint(
						endpointServers, this._apiProvider.managementApi, endpoint,
						FLogger.create(this.log.name + friendlyEndpoint.type + " " + friendlyEndpoint.bindPath)
					);
					this._endpointInstances.push(endpointInstance);
					break;
				}
				case "rest-publisher": {
					const friendlyEndpoint: Configuration.RestPublisherEndpoint = endpoint;
					const endpointInstance = new PublisherApiRestEndpoint(
						endpointServers, this._apiProvider.publisherApi, endpoint,
						//this.log.getLogger(friendlyEndpoint.type + " " + friendlyEndpoint.bindPath)
					);
					this._endpointInstances.push(endpointInstance);
					publisherApiRestEndpoints.push(endpointInstance);
					break;
				}
				case "rest-subscriber": {
					const friendlyEndpoint: Configuration.RestSubscriberEndpoint = endpoint;
					const endpointInstance = new SubscriberApiRestEndpoint(
						endpointServers, this._apiProvider.subscriberApi, endpoint,
						FLogger.create(this.log.name + friendlyEndpoint.type + " " + friendlyEndpoint.bindPath)
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

	protected async onInit(): Promise<void> {
		this.log.info(this.initExecutionContext, "Initializing endpoints...");
		try {
			for (const endpointInstance of this._endpointInstances) {
				await endpointInstance.init(this.initExecutionContext);
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
		this.log.info(this.initExecutionContext, "Destroying endpoints...");
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

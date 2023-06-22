import { FExecutionContext, FInitable, FInitableBase, FLogger } from "@freemework/common";
import { FWebServer } from "@freemework/hosting";

import { Container, Provides, Singleton } from "typescript-ioc";

import * as _ from "lodash";

import { Settings, SettingsException } from "../settings";

// Providers
import { ApiProvider } from "./api_provider";
import { SettingsProvider } from "./settings_provider";
import { HostingProvider } from "./hosting_provider";

// Endpoints
import { InfoRestEndpoint } from "../endpoints/info_rest_endpoint";
import { ManagementApiRestEndpoint } from "../endpoints/management_api_rest_endpoint";
import { IngressApiRestEndpoint } from "../endpoints/ingress_api_rest_endpoint";
import { EgressApiRestEndpoint } from "../endpoints/egress_api_rest_endpoint";
import { WebSocketHostEgressEndpoint } from "../endpoints/websocket_host_egress_endpoint";
import { ProviderLocator } from "../provider_locator";
import { ManagementApiProvider } from "./management_api_provider";

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

	public abstract get ingressApiRestEndpoints(): ReadonlyArray<IngressApiRestEndpoint>;
	public abstract get egressApiRestEndpoints(): ReadonlyArray<EgressApiRestEndpoint>;
}

@Provides(EndpointsProvider)
class EndpointsProviderImpl extends EndpointsProvider {
	// Do not use Inject inside providers to prevents circular dependency
	private readonly _configProvider: SettingsProvider;
	private readonly _apiProvider: ApiProvider;
	private readonly _managementApiProvider: ManagementApiProvider;
	private readonly _hostingProvider: HostingProvider;

	private readonly _endpointInstances: Array<FInitable>;
	private readonly _destroyHandlers: Array<() => Promise<void>>;
	private readonly _ingressApiRestEndpoints: ReadonlyArray<IngressApiRestEndpoint>;
	private readonly _egressApiRestEndpoints: ReadonlyArray<EgressApiRestEndpoint>;

	public constructor() {
		super();

		this.log.info(FExecutionContext.Empty, "Constructing endpoints...");

		this._hostingProvider = ProviderLocator.default.get(HostingProvider);
		this._configProvider = ProviderLocator.default.get(SettingsProvider);
		this._apiProvider = ProviderLocator.default.get(ApiProvider);
		this._managementApiProvider = ProviderLocator.default.get(ManagementApiProvider);

		this._endpointInstances = [];

		const ingressApiRestEndpoints: Array<IngressApiRestEndpoint> = [];
		const egressApiRestEndpoints: Array<EgressApiRestEndpoint> = [];

		for (const endpoint of this._configProvider.endpoints) {

			if (endpoint.type === "express-router-management" || endpoint.type === "express-router-ingress") {
				throw new Error("Not supported yet");
			}

			const serversMap: Map<HostingProvider.ServerInstance["name"], HostingProvider.ServerInstance> = new Map();
			this._hostingProvider.serverInstances.forEach(s => serversMap.set(s.name, s));

			const endpointServers: Array<FWebServer> = [];
			for (const bindServer of endpoint.servers) {
				const serverInstance: HostingProvider.ServerInstance | undefined = serversMap.get(bindServer);
				if (serverInstance === undefined) {
					throw new SettingsException(`Cannot bind an endpoint '${endpoint.type}' to a server '${bindServer}'. The server is not defined.`);
				}
				endpointServers.push(serverInstance.server);
			}

			switch (endpoint.type) {
				case "rest-info": {
					const friendlyEndpoint: Settings.RestInfoEndpoint = endpoint;
					const endpointInstance = new InfoRestEndpoint(
						endpointServers, endpoint,
						FLogger.create(this.log.name + friendlyEndpoint.type + " " + friendlyEndpoint.bindPath)
					);
					this._endpointInstances.push(endpointInstance);
					break;
				}
				case "rest-management": {
					const friendlyEndpoint: Settings.RestManagementEndpoint = endpoint;
					const endpointInstance = new ManagementApiRestEndpoint(
						endpointServers, this._managementApiProvider, endpoint,
						FLogger.create(this.log.name + friendlyEndpoint.type + " " + friendlyEndpoint.bindPath)
					);
					this._endpointInstances.push(endpointInstance);
					break;
				}
				case "rest-ingress": {
					const friendlyEndpoint: Settings.RestPublisherEndpoint = endpoint;
					const endpointInstance = new IngressApiRestEndpoint(
						endpointServers, this._apiProvider.publisherApi, friendlyEndpoint,
						//this.log.getLogger(friendlyEndpoint.type + " " + friendlyEndpoint.bindPath)
					);
					this._endpointInstances.push(endpointInstance);
					ingressApiRestEndpoints.push(endpointInstance);
					break;
				}
				case "rest-egress": {
					const friendlyEndpoint: Settings.RestSubscriberEndpoint = endpoint;
					const endpointInstance = new EgressApiRestEndpoint(
						endpointServers, this._apiProvider.egressApi, endpoint,
						FLogger.create(this.log.name + friendlyEndpoint.type + " " + friendlyEndpoint.bindPath)
					);
					this._endpointInstances.push(endpointInstance);
					egressApiRestEndpoints.push(endpointInstance);
					break;
				}
				default:
					throw new UnreachableEndpointError(endpoint);
			}
		}

		this._destroyHandlers = [];

		this._ingressApiRestEndpoints = Object.freeze(ingressApiRestEndpoints);
		this._egressApiRestEndpoints = Object.freeze(egressApiRestEndpoints);
	}

	public get ingressApiRestEndpoints(): ReadonlyArray<IngressApiRestEndpoint> {
		return this._ingressApiRestEndpoints;
	}

	public get egressApiRestEndpoints(): ReadonlyArray<EgressApiRestEndpoint> {
		return this._egressApiRestEndpoints;
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

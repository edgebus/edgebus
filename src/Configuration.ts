import { Configuration as RawConfiguration } from "@zxteam/contract";
import { Configuration as HostingConfiguration } from "@zxteam/hosting";

import { URL } from "url";
import { Router } from "express-serve-static-core";

import { NotifierService } from "./service/NotifierService";
import { InnerError } from "@zxteam/errors";

export interface Configuration {
	/**
	 * Servers
	 */
	readonly servers: ReadonlyArray<HostingConfiguration.WebServer>;

	/**
	 * Endpoints configuration
	 */
	readonly endpoints: ReadonlyArray<Configuration.Endpoint>;

	/**
	 * Connection URL to database
	 */
	readonly notifierServiceOpts: NotifierService.Opts;
}

export namespace Configuration {
	export type Endpoint = RestManagementEndpoint | RestPublisherEndpoint | ExpressRouterManagementEndpoint | ExpressRouterPublisherEndpoint;

	export interface RestManagementEndpoint extends HostingConfiguration.ServerEndpoint, HostingConfiguration.BindEndpoint {
		readonly type: "rest-management";
	}
	export interface RestPublisherEndpoint extends HostingConfiguration.ServerEndpoint, HostingConfiguration.BindEndpoint {
		readonly type: "rest-publisher";
	}
	export interface ExpressRouterManagementEndpoint extends HostingConfiguration.BindEndpoint {
		readonly type: "express-router-management";
		readonly router: Router;
	}
	export interface ExpressRouterPublisherEndpoint extends HostingConfiguration.BindEndpoint {
		readonly type: "express-router-publisher";
		readonly router: Router;
	}
}

export function configurationFactory(configuration: RawConfiguration): Configuration {
	const servers: ReadonlyArray<HostingConfiguration.WebServer> = Object.freeze(HostingConfiguration.parseWebServers(configuration));

	const endpoints: ReadonlyArray<Configuration.Endpoint> = Object.freeze(configuration.getString("endpoints").split(" ").map(
		(endpointIndex: string): Configuration.Endpoint => {
			return parseEndpoint(configuration, endpointIndex);
		}
	));

	const notifierServiceOpts: NotifierService.Opts = Object.freeze({
		cacheStorageURL: configuration.getURL("cacheStorage.url"),
		persistentStorageURL: configuration.getURL("persistentStorage.url")
	});

	const appConfig: Configuration = Object.freeze({ servers, endpoints, notifierServiceOpts });
	return appConfig;
}

export class ConfigurationError extends InnerError { }


//  ___           _                                   _
// |_ _|  _ __   | |_    ___   _ __   _ __     __ _  | |
//  | |  | '_ \  | __|  / _ \ | '__| | '_ \   / _` | | |
//  | |  | | | | | |_  |  __/ | |    | | | | | (_| | | |
// |___| |_| |_|  \__|  \___| |_|    |_| |_|  \__,_| |_|


function parseEndpoint(configuration: RawConfiguration, endpointIndex: string): Configuration.Endpoint {
	const endpointConfiguration: RawConfiguration = configuration.getConfiguration(`endpoint.${endpointIndex}`);
	const endpointType = endpointConfiguration.getString("type");
	switch (endpointType) {
		case "rest-management": {
			const httpEndpoint: Configuration.RestManagementEndpoint = Object.freeze({
				type: "rest-management",
				servers: endpointConfiguration.getString("servers").split(" "),
				bindPath: endpointConfiguration.getString("bindPath", "/")
			});
			return httpEndpoint;
		}
		default:
			throw new Error(`Non supported endpont type: ${endpointType}`);
	}
}

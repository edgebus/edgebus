import { FConfiguration, FException, FExceptionInvalidOperation } from "@freemework/common";
import { FHostingConfiguration } from "@freemework/hosting";

import { Router } from "express-serve-static-core";

import * as _ from "lodash";

export class Configuration {
	private constructor(
		/**
		 * Servers
		 */
		public readonly servers: ReadonlyArray<FHostingConfiguration.WebServer>,

		/**
		 * Endpoints configuration
		 */
		public readonly endpoints: ReadonlyArray<Configuration.Endpoint>,

		/**
		 * Connection URL to persistent storage (for example PostgreSQL)
		 */
		public readonly persistentStorageURL: URL,

		/**
		 * Connection URL to cache storage (for example Redis)
		 */
		public readonly cacheStorageURL: URL
	) { }

	public static parse(configuration: FConfiguration): Configuration {
		const servers: ReadonlyArray<FHostingConfiguration.WebServer> = Object.freeze(FHostingConfiguration.parseWebServers(configuration));

		const endpoints: ReadonlyArray<Configuration.Endpoint> = Object.freeze(configuration.get("endpoints").asString.split(" ").map(
			(endpointIndex: string): Configuration.Endpoint => {
				return parseEndpoint(configuration, endpointIndex);
			}
		));

		const cacheStorageURL: URL = configuration.get("cacheStorage.url").asUrl;
		const persistentStorageURL: URL = configuration.get("persistentStorage.url").asUrl;

		const appConfig: Configuration = new Configuration(
			servers,
			endpoints,
			persistentStorageURL,
			cacheStorageURL,
		);

		return appConfig;
	}
}

export namespace Configuration {

	export type Endpoint =
		| RestInfoEndpoint
		| RestManagementEndpoint
		| RestPublisherEndpoint
		| RestSubscriberEndpoint
		| ExpressRouterManagementEndpoint
		| ExpressRouterPublisherEndpoint;

	export interface BaseRestEndpoint extends FHostingConfiguration.BindEndpoint, FHostingConfiguration.ServerEndpoint {
		readonly cors: Cors | null;
	}
	export interface RestInfoEndpoint extends BaseRestEndpoint {
		readonly type: "rest-info";
	}	export interface RestManagementEndpoint extends BaseRestEndpoint {
		readonly type: "rest-management";
	}
	export interface RestPublisherEndpoint extends BaseRestEndpoint {
		readonly type: "rest-publisher";
	}
	export interface RestSubscriberEndpoint extends BaseRestEndpoint {
		readonly type: "rest-subscriber";
	}
	export interface ExpressRouterManagementEndpoint extends FHostingConfiguration.BindEndpoint {
		readonly type: "express-router-management";
		readonly router: Router;
	}
	export interface ExpressRouterPublisherEndpoint extends FHostingConfiguration.BindEndpoint {
		readonly type: "express-router-publisher";
		readonly router: Router;
	}

	export interface Cors {
		readonly methods: ReadonlyArray<string>;
		readonly whiteList: ReadonlyArray<string>;
		readonly allowedHeaders: ReadonlyArray<string>;
	}

	export interface SSL {
		readonly caCert?: Buffer;
		readonly clientCert?: {
			readonly cert: Buffer;
			readonly key: Buffer;
		};
	}
}

export class ConfigurationException extends FException { }


//  ___           _                                   _
// |_ _|  _ __   | |_    ___   _ __   _ __     __ _  | |
//  | |  | '_ \  | __|  / _ \ | '__| | '_ \   / _` | | |
//  | |  | | | | | |_  |  __/ | |    | | | | | (_| | | |
// |___| |_| |_|  \__|  \___| |_|    |_| |_|  \__,_| |_|


function parseEndpoint(configuration: FConfiguration, endpointIndex: string): Configuration.Endpoint {
	const endpointConfiguration: FConfiguration = configuration.getNamespace(`endpoint.${endpointIndex}`);
	const endpointType: Configuration.Endpoint["type"] = endpointConfiguration.get("type").asString as Configuration.Endpoint["type"];
	switch (endpointType) {
		case "rest-info": {
			const cors = endpointConfiguration.hasNamespace("cors")
				? parseCors(endpointConfiguration.getNamespace("cors")) : null;

			const httpEndpoint: Configuration.RestInfoEndpoint = Object.freeze({
				type: endpointType,
				servers: endpointConfiguration.get("servers").asString.split(" "),
				bindPath: endpointConfiguration.get("bindPath", "/").asString,
				cors
			});
			return httpEndpoint;
		}
		case "rest-management": {
			const cors = endpointConfiguration.hasNamespace("cors")
				? parseCors(endpointConfiguration.getNamespace("cors")) : null;

			const httpEndpoint: Configuration.RestManagementEndpoint = Object.freeze({
				type: endpointType,
				servers: endpointConfiguration.get("servers").asString.split(" "),
				bindPath: endpointConfiguration.get("bindPath", "/").asString,
				cors
			});
			return httpEndpoint;
		}
		case "rest-publisher": {
			const cors = endpointConfiguration.hasNamespace("cors")
				? parseCors(endpointConfiguration.getNamespace("cors")) : null;

			const httpEndpoint: Configuration.RestPublisherEndpoint = Object.freeze({
				type: endpointType,
				servers: endpointConfiguration.get("servers").asString.split(" "),
				bindPath: endpointConfiguration.get("bindPath", "/").asString,
				cors
			});
			return httpEndpoint;
		}
		case "rest-subscriber": {
			const cors = endpointConfiguration.hasNamespace("cors")
				? parseCors(endpointConfiguration.getNamespace("cors")) : null;

			const httpEndpoint: Configuration.RestSubscriberEndpoint = Object.freeze({
				type: endpointType,
				servers: endpointConfiguration.get("servers").asString.split(" "),
				bindPath: endpointConfiguration.get("bindPath", "/").asString,
				cors
			});
			return httpEndpoint;
		}
		case "express-router-management":
		case "express-router-publisher":
			throw new FExceptionInvalidOperation(`Endpoint type '${endpointType}' may not be parsed as config item.`);
		default:
			throw new UnreachableNotSupportedEndpointError(endpointType);
	}
}

function parseCors(configuration: FConfiguration): Configuration.Cors {
	const methods: ReadonlyArray<string> = Object.freeze(configuration.get("methods").asString.split(" "));
	const whiteList: ReadonlyArray<string> = Object.freeze(configuration.get("whiteList").asString.split(" "));
	const allowedHeaders: ReadonlyArray<string> = Object.freeze(configuration.get("allowedHeaders").asString.split(" "));
	return Object.freeze({ methods, whiteList, allowedHeaders });
}

class UnreachableNotSupportedEndpointError extends Error {
	public constructor(endpointType: never) {
		super(`Non supported endpoint type: ${endpointType}`);
	}
}

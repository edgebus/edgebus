import { Configuration as RawConfiguration, CancellationToken } from "@zxteam/contract";
import {
	envConfiguration, fileConfiguration,
	chainConfiguration, secretsDirectoryConfiguration
} from "@zxteam/configuration";
import { InnerError, InvalidOperationError } from "@zxteam/errors";
import { Configuration as HostingConfiguration } from "@zxteam/hosting";
import { LaunchError } from "@zxteam/launcher";

import { Router } from "express-serve-static-core";

import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

import { NotifierService } from "./service/NotifierService";

const exists = util.promisify(fs.exists);

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
	 * Connection URL to persistent storage (for example PostgreSQL)
	 */
	readonly persistentStorageURL: URL;

	/**
	 * Connection URL to cache storage (for example Redis)
	 */
	readonly cacheStorageURL: URL;
}

export namespace Configuration {
	export type Endpoint = RestManagementEndpoint | RestPublisherEndpoint | RestSubscriberEndpoint
		| ExpressRouterManagementEndpoint | ExpressRouterPublisherEndpoint;

	export interface RestManagementEndpoint extends HostingConfiguration.ServerEndpoint, HostingConfiguration.BindEndpoint {
		readonly type: "rest-management";
	}
	export interface RestPublisherEndpoint extends HostingConfiguration.ServerEndpoint, HostingConfiguration.BindEndpoint {
		readonly type: "rest-publisher";
	}
	export interface RestSubscriberEndpoint extends HostingConfiguration.ServerEndpoint, HostingConfiguration.BindEndpoint {
		readonly type: "rest-subscriber";
	}
	export interface ExpressRouterManagementEndpoint extends HostingConfiguration.BindEndpoint {
		readonly type: "express-router-management";
		readonly router: Router;
	}
	export interface ExpressRouterPublisherEndpoint extends HostingConfiguration.BindEndpoint {
		readonly type: "express-router-publisher";
		readonly router: Router;
	}

	export interface SSL {
		readonly caCert?: Buffer;
		readonly clientCert?: {
			readonly cert: Buffer;
			readonly key: Buffer;
		};
	}
}

export async function configurationFactory(cancellationToken: CancellationToken): Promise<Configuration> {
	let configFileArg = process.argv.find(w => w.startsWith("--config="));

	if (process.env.NODE_ENV === "development" && configFileArg === undefined) {
		const defaultConfigFile: string = path.normalize(path.join(__dirname, "..", "cpservice.config"));
		if (await exists(defaultConfigFile)) {
			console.warn(`An argument --config is not passed. In development mode we using default configuration file: ${defaultConfigFile}`);
			configFileArg = `--config=${defaultConfigFile}`;
		}
	}

	if (configFileArg === undefined) {
		throw new LaunchError("An argument --config is not passed");
	}

	const secretsDirArg = process.argv.find(w => w.startsWith("--secrets-dir="));

	const chainItems: Array<RawConfiguration> = [];

	const envConf = envConfiguration();
	chainItems.push(envConf);

	if (secretsDirArg !== undefined) {
		const secretsDir = secretsDirArg.substring(14); // Cut --secrets-dir=
		const secretsConfiguration = await secretsDirectoryConfiguration(secretsDir);
		chainItems.push(secretsConfiguration);
	}

	const configFile = configFileArg.substring(9); // Cut --config=
	if (process.env.NODE_ENV === "development") {
		const configFileDir = path.dirname(configFile);
		const configFileExtension = path.extname(configFile);
		const configFileName = path.basename(configFile, configFileExtension);
		const develConfigFile = path.join(configFileDir, `${configFileName}.dev-${configFileExtension.substring(1)}`);
		if (await exists(develConfigFile)) {
			const develFileConf = fileConfiguration(develConfigFile);
			chainItems.push(develFileConf);
		}
		cancellationToken.throwIfCancellationRequested();
	}
	const fileConf = fileConfiguration(configFile);
	chainItems.push(fileConf);

	const appConfiguration = parseConfiguration(
		chainConfiguration(...chainItems)
	);

	return appConfiguration;
}


export class ConfigurationError extends InnerError { }


//  ___           _                                   _
// |_ _|  _ __   | |_    ___   _ __   _ __     __ _  | |
//  | |  | '_ \  | __|  / _ \ | '__| | '_ \   / _` | | |
//  | |  | | | | | |_  |  __/ | |    | | | | | (_| | | |
// |___| |_| |_|  \__|  \___| |_|    |_| |_|  \__,_| |_|


function parseConfiguration(configuration: RawConfiguration): Configuration {
	const servers: ReadonlyArray<HostingConfiguration.WebServer> = Object.freeze(HostingConfiguration.parseWebServers(configuration));

	const endpoints: ReadonlyArray<Configuration.Endpoint> = Object.freeze(configuration.getString("endpoints").split(" ").map(
		(endpointIndex: string): Configuration.Endpoint => {
			return parseEndpoint(configuration, endpointIndex);
		}
	));

	const cacheStorageURL: URL = configuration.getURL("cacheStorage.url");
	const persistentStorageURL: URL = configuration.getURL("persistentStorage.url");

	const appConfig: Configuration = Object.freeze({ servers, endpoints, cacheStorageURL, persistentStorageURL });

	return appConfig;
}


function parseEndpoint(configuration: RawConfiguration, endpointIndex: string): Configuration.Endpoint {
	const endpointConfiguration: RawConfiguration = configuration.getConfiguration(`endpoint.${endpointIndex}`);
	const endpointType: Configuration.Endpoint["type"] = endpointConfiguration.getString("type") as Configuration.Endpoint["type"];
	switch (endpointType) {
		case "rest-management": {
			const httpEndpoint: Configuration.RestManagementEndpoint = Object.freeze({
				type: endpointType,
				servers: endpointConfiguration.getString("servers").split(" "),
				bindPath: endpointConfiguration.getString("bindPath", "/")
			});
			return httpEndpoint;
		}
		case "rest-publisher": {
			const httpEndpoint: Configuration.RestPublisherEndpoint = Object.freeze({
				type: endpointType,
				servers: endpointConfiguration.getString("servers").split(" "),
				bindPath: endpointConfiguration.getString("bindPath", "/")
			});
			return httpEndpoint;
		}
		case "rest-subscriber": {
			const httpEndpoint: Configuration.RestSubscriberEndpoint = Object.freeze({
				type: endpointType,
				servers: endpointConfiguration.getString("servers").split(" "),
				bindPath: endpointConfiguration.getString("bindPath", "/")
			});
			return httpEndpoint;
		}
		case "express-router-management":
		case "express-router-publisher":
			throw new InvalidOperationError(`Endpoint type '${endpointType}' may not be parsed as config item.`);
		default:
			throw new UnreachableNotSupportedEndpointError(endpointType);
	}
}

class UnreachableNotSupportedEndpointError extends Error {
	public constructor(endpointType: never) {
		super(`Non supported endpoint type: ${endpointType}`);
	}
}

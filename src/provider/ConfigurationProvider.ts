import { FInitableBase, FExceptionInvalidOperation } from "@freemework/common";
import { FHostingConfiguration } from "@freemework/hosting";
import { Provides, Singleton } from "typescript-ioc";
import { Configuration } from "../Configuration";


@Singleton
export abstract class ConfigurationProvider implements Configuration {
	abstract get servers(): ReadonlyArray<FHostingConfiguration.WebServer>;
	abstract get endpoints(): ReadonlyArray<Configuration.Endpoint>;
	abstract get cacheStorageURL(): URL;
	abstract get persistentStorageURL(): URL;
	abstract get setup(): Configuration.Setup | null;
}

@Provides(ConfigurationProvider)
/**
 * The adapter class implements DI Provider + Configuration
 */
export class ConfigurationProviderImpl extends ConfigurationProvider {
	private readonly _configuration: Configuration;

	public constructor(configuration: Configuration) {
		super();
		this._configuration = configuration;
	}

	public get servers() { return this._configuration.servers; }
	public get endpoints() { return this._configuration.endpoints; }
	public get cacheStorageURL() { return this._configuration.cacheStorageURL; }
	public get persistentStorageURL() { return this._configuration.persistentStorageURL; }
	public get setup() { return this._configuration.setup; }
}

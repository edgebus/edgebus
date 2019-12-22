import { CancellationToken } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";
import { Configuration as HostingConfiguration } from "@zxteam/hosting";
import { Provides, Singleton } from "@zxteam/launcher";

import { Configuration, configurationFactory } from "../Configuration";


@Singleton
export abstract class ConfigurationProvider extends Initable implements Configuration {
	abstract get servers(): ReadonlyArray<HostingConfiguration.WebServer>;
	abstract get endpoints(): ReadonlyArray<Configuration.Endpoint>;
	abstract get cacheStorageURL(): URL;
	abstract get persistentStorageURL(): URL;
}

@Provides(ConfigurationProvider)
/**
 * The adapter class implements DI Provider + Configuration
 */
class ConfigurationProviderImpl extends ConfigurationProvider {
	private __configuration: Configuration | null;

	public constructor() {
		super();
		this.__configuration = null;
	}

	public get servers() { return this._configuration.servers; }
	public get endpoints() { return this._configuration.endpoints; }
	public get cacheStorageURL() { return this._configuration.cacheStorageURL; }
	public get persistentStorageURL() { return this._configuration.persistentStorageURL; }

	protected async onInit(cancellationToken: CancellationToken): Promise<void> {
		this.__configuration = await configurationFactory(cancellationToken);
	}

	protected onDispose() {
		// Nothing to dispose
	}

	private get _configuration(): Configuration {
		if (this.__configuration === null) {
			throw new InvalidOperationError("Wrong operation at current state. Did you init()?");
		}
		return this.__configuration;
	}
}

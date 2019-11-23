import { Configuration as HostingConfiguration } from "@zxteam/hosting";
import { Singleton } from "@zxteam/launcher";

import { Configuration } from "../Configuration";
import { NotifierService } from "../service/NotifierService";

@Singleton
export abstract class ConfigurationProvider implements Configuration {
	abstract get servers(): ReadonlyArray<HostingConfiguration.WebServer>;
	abstract get endpoints(): ReadonlyArray<Configuration.Endpoint>;
	abstract get notifierServiceOpts(): NotifierService.Opts;
}

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
	public get notifierServiceOpts() { return this._configuration.notifierServiceOpts; }
}

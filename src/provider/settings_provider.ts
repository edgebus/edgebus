import { FInitableBase, FExceptionInvalidOperation } from "@freemework/common";
import { FHostingConfiguration } from "@freemework/hosting";

import { Provides, Singleton } from "typescript-ioc";

import { Settings } from "../settings";


@Singleton
export abstract class SettingsProvider implements Settings {
	abstract get servers(): ReadonlyArray<FHostingConfiguration.WebServer>;
	abstract get endpoints(): ReadonlyArray<Settings.Endpoint>;
	abstract get messageBus(): Settings.MessageBus;
	abstract get persistentStorageURL(): URL;
	abstract get setup(): Settings.Setup | null;
}

@Provides(SettingsProvider)
/**
 * The adapter class implements DI Provider + Settings
 */
export class SettingsProviderImpl extends SettingsProvider {
	private readonly _configuration: Settings;

	public constructor(configuration: Settings) {
		super();
		this._configuration = configuration;
	}

	public get servers() { return this._configuration.servers; }
	public get endpoints() { return this._configuration.endpoints; }
	public get messageBus() { return this._configuration.messageBus; }
	public get persistentStorageURL() { return this._configuration.persistentStorageURL; }
	public get setup() { return this._configuration.setup; }
}

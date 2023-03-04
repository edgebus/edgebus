import { FExecutionContext, FInitableBase, FLogger } from "@freemework/common";
import { Container, Provides, Singleton } from "typescript-ioc";

import * as _ from "lodash";

import { SettingsProvider } from "./settings_provider";
import { PersistentStorage } from "../data/persistent_storage";
import { PostgresPersistentStorage } from "../data/postgres_persistent_storage";

@Singleton
export abstract class StorageProvider extends FInitableBase {
	protected readonly log: FLogger;

	public constructor() {
		super();
		this.log = FLogger.create("Storage");
		if (this.log.isDebugEnabled) {
			this.log.debug(FExecutionContext.Empty, `Implementation: ${this.constructor.name}`);
		}
	}

	// public abstract get cacheStorage(): any;
	public abstract get persistentStorage(): PersistentStorage;
}

@Provides(StorageProvider)
class StorageProviderImpl extends StorageProvider {
	// Do not use Inject inside providers to prevents circular dependency
	private readonly _configProvider: SettingsProvider;

	// private readonly _cacheStorage: StorageProvider["cacheStorage"];
	private readonly _persistentStorage: PersistentStorage;

	public constructor() {
		super();

		this._configProvider = Container.get(SettingsProvider);

		// this._cacheStorage = null; //RedisCacheStorage(this.configProvider.cacheStorageURL, this.log);
		this._persistentStorage = new PostgresPersistentStorage(this._configProvider.persistentStorageURL, this.log);
	}

	// public get cacheStorage() { return this._cacheStorage; }
	public get persistentStorage() { return this._persistentStorage; }

	protected async onInit() {
		// await this._cacheStorage.init(cancellationToken);
		await this._persistentStorage.init(this.initExecutionContext);
	}

	protected async onDispose() {
		// await this._cacheStorage.dispose();
		await this._persistentStorage.dispose();
	}
}

import { FExecutionContext, FInitableBase, FLogger } from "@freemework/common";
import { Container, Provides, Singleton } from "typescript-ioc";

import * as _ from "lodash";

import { SettingsProvider } from "./settings_provider";
import { Database } from "../data/database";
import { DatabaseFactory } from "../data/database_factory";
import { PostgresDatabaseFactory } from "../data/postgres/postgres_database_factory";
import { ProviderLocator } from "../provider_locator";

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
	public abstract get databaseFactory(): DatabaseFactory;
}

@Provides(StorageProvider)
class StorageProviderImpl extends StorageProvider {
	// Do not use Inject inside providers to prevents circular dependency
	private readonly _configProvider: SettingsProvider;

	// private readonly _cacheStorage: StorageProvider["cacheStorage"];
	private readonly _databaseFactory: PostgresDatabaseFactory;

	public constructor() {
		super();

		this._configProvider = ProviderLocator.default.get(SettingsProvider);

		// this._cacheStorage = null; //RedisCacheStorage(this.configProvider.cacheStorageURL, this.log);
		this._databaseFactory = new PostgresDatabaseFactory(this._configProvider.persistentStorageURL);
	}

	// public get cacheStorage() { return this._cacheStorage; }
	public get databaseFactory(): DatabaseFactory { return this._databaseFactory; }

	protected async onInit() {
		// await this._cacheStorage.init(cancellationToken);
		await this._databaseFactory.init(this.initExecutionContext);
	}

	protected async onDispose() {
		// await this._cacheStorage.dispose();
		await this._databaseFactory.dispose();
	}
}

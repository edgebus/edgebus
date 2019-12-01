import { Logger, CancellationToken } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { Inject, Provides, Singleton } from "@zxteam/launcher";
import { logger } from "@zxteam/logger";

import * as _ from "lodash";

import { ConfigurationProvider } from "./ConfigurationProvider";
import { PersistentStorage } from "../data/PersistentStorage";
import { SQLPersistentStorage } from "../data/SQLPersistentStorage";

@Singleton
export abstract class StorageProvider extends Initable {
	protected readonly log: Logger;

	public constructor() {
		super();
		this.log = logger.getLogger("Storage");
		if (this.log.isDebugEnabled) {
			this.log.debug(`Implementation: ${this.constructor.name}`);
		}
	}

	public abstract get cacheStorage(): any;
	public abstract get persistentStorage(): PersistentStorage;
}

@Provides(StorageProvider)
class StorageProviderImpl extends StorageProvider {
	@Inject
	private readonly configProvider!: ConfigurationProvider;

	private readonly _cacheStorage: StorageProvider["cacheStorage"];
	private readonly _persistentStorage: PersistentStorage;

	public constructor() {
		super();
		this._cacheStorage = null; //storageFactory(this.configProvider.notifierServiceOpts.persistentStorageURL, this.log);
		this._persistentStorage = new SQLPersistentStorage(this.configProvider.notifierServiceOpts.persistentStorageURL, this.log);
	}

	public get cacheStorage() { return this._cacheStorage; }
	public get persistentStorage() { return this._persistentStorage; }

	protected async onInit(cancellationToken: CancellationToken) {
		// await this._cacheStorage.init(cancellationToken);
		await this._persistentStorage.init(cancellationToken);
	}

	protected async onDispose() {
		// await this._cacheStorage.dispose();
		await this._persistentStorage.dispose();
	}
}

import { FDisposable, FInitable, FInitableBase, FLogger } from "@freemework/common";

import { Provides, Singleton } from "typescript-ioc";

// APIs
import { ManagementApi } from "../api/management_api";
import { PublisherApi } from "../api/publisher_api";
import { EgressApi } from "../api/egress_api";

import { MessageBusProvider } from "./message_bus_provider";
import { StorageProvider } from "./storage_provider";
import { ProviderLocator } from "../provider_locator";

@Singleton
export abstract class ApiProvider extends FInitableBase {
	abstract get publisherApi(): PublisherApi;
	abstract get egressApi(): EgressApi;
}

@Provides(ApiProvider)
class ApiProviderImpl extends ApiProvider {
	// Do not use Inject inside providers to prevents circular dependency
	private readonly _storageProvider: StorageProvider;
	private readonly _messageBusProvider: MessageBusProvider;

	private readonly _publisherApi: PublisherApi;
	private readonly _egressApi: EgressApi;

	public constructor() {
		super();

		this._storageProvider = ProviderLocator.default.get(StorageProvider);
		this._messageBusProvider = ProviderLocator.default.get(MessageBusProvider);

		this._publisherApi
			= new PublisherApi(this._storageProvider.databaseFactory, this._messageBusProvider, FLogger.create("PublisherApi"));
		this._egressApi
			= new EgressApi(this._storageProvider.databaseFactory, FLogger.create("SubscriberApi"));
	}

	public get publisherApi() { return this._publisherApi; }
	public get egressApi() { return this._egressApi; }

	protected async onInit(): Promise<void> {
		await FInitable.initAll(this.initExecutionContext, this._publisherApi, this._egressApi);
	}

	protected async onDispose(): Promise<void> {
		await FDisposable.disposeAll(this._egressApi, this._publisherApi);
	}
}

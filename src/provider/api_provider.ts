import { FDisposable, FInitable, FInitableBase, FLogger } from "@freemework/common";

import { Provides, Singleton } from "typescript-ioc";

// APIs
import { ManagementApi } from "../api/management_api";
import { PublisherApi } from "../api/publisher_api";
import { SubscriberApi } from "../api/subscriber_api";

import { MessageBusProvider } from "./message_bus_provider";
import { StorageProvider } from "./storage_provider";
import { ProviderLocator } from "../provider_locator";

@Singleton
export abstract class ApiProvider extends FInitableBase {
	abstract get managementApi(): ManagementApi;
	abstract get publisherApi(): PublisherApi;
	abstract get subscriberApi(): SubscriberApi;
}

@Provides(ApiProvider)
class ApiProviderImpl extends ApiProvider {
	// Do not use Inject inside providers to prevents circular dependency
	private readonly _storageProvider: StorageProvider;
	private readonly _messageBusProvider: MessageBusProvider;

	private readonly _managementApi: ManagementApi;
	private readonly _publisherApi: PublisherApi;
	private readonly _subscriberApi: SubscriberApi;

	public constructor() {
		super();

		this._storageProvider = ProviderLocator.default.get(StorageProvider);
		this._messageBusProvider = ProviderLocator.default.get(MessageBusProvider);

		this._managementApi
			= new ManagementApi(this._storageProvider.databaseFactory);
		this._publisherApi
			= new PublisherApi(this._storageProvider.databaseFactory, this._messageBusProvider, FLogger.create("PublisherApi"));
		this._subscriberApi
			= new SubscriberApi(this._storageProvider.databaseFactory, FLogger.create("SubscriberApi"));
	}

	public get managementApi() { return this._managementApi; }
	public get publisherApi() { return this._publisherApi; }
	public get subscriberApi() { return this._subscriberApi; }

	protected async onInit(): Promise<void> {
		await FInitable.initAll(this.initExecutionContext, this._managementApi, this._publisherApi, this._subscriberApi);
	}

	protected async onDispose(): Promise<void> {
		await FDisposable.disposeAll(this._subscriberApi, this._publisherApi, this._managementApi);
	}
}

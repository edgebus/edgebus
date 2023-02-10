import { FDisposable, FInitable, FInitableBase, FLogger } from "@freemework/common";

import { Container, Provides, Singleton } from "typescript-ioc";

// Providers
import { StorageProvider } from "./StorageProvider";

// APIs
import { ManagementApi } from "../api/ManagementApi";
import { PublisherApi } from "../api/PublisherApi";
import { SubscriberApi } from "../api/SubscriberApi";
import { MessageBusProvider } from "./MessageBusProvider";

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

		this._storageProvider = Container.get(StorageProvider);
		this._messageBusProvider = Container.get(MessageBusProvider);

		const logger = FLogger.create(this.constructor.name);

		this._managementApi
			= new ManagementApi(this._storageProvider.persistentStorage, FLogger.create("ManagementApi"));
		this._publisherApi
			= new PublisherApi(this._storageProvider.persistentStorage, this._messageBusProvider, FLogger.create("PublisherApi"));
		this._subscriberApi
			= new SubscriberApi(this._storageProvider.persistentStorage, FLogger.create("SubscriberApi"));
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

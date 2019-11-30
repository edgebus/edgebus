import { CancellationToken } from "@zxteam/contract";
import { Initable, Disposable } from "@zxteam/disposable";
import { Inject, Provides, Singleton } from "@zxteam/launcher";
import { logger } from "@zxteam/logger";

// Providers
import { StorageProvider } from "./StorageProvider";

// APIs
import { ManagementApi } from "../api/ManagementApi";
import { PublisherApi } from "../api/PublisherApi";
import { SubscriberApi } from "../api/SubscriberApi";
import { MessageBusProvider } from "./MessageBusProvider";

@Singleton
export abstract class ApiProvider extends Initable {
	abstract get managementApi(): ManagementApi;
	abstract get publisherApi(): PublisherApi;
	abstract get subscriberApi(): SubscriberApi;
}

@Provides(ApiProvider)
class ApiProviderImpl extends ApiProvider {
	@Inject
	private readonly _storageProvider!: StorageProvider;
	@Inject
	private readonly _messageBusProvider!: MessageBusProvider;

	private readonly _managementApi: ManagementApi;
	private readonly _publisherApi: PublisherApi;
	private readonly _subscriberApi: SubscriberApi;

	public constructor() {
		super();

		this._managementApi = new ManagementApi(this._storageProvider, logger.getLogger("ManagementApi"));
		this._publisherApi = new PublisherApi(this._storageProvider, this._messageBusProvider, logger.getLogger("PublisherApi"));
		this._subscriberApi = new SubscriberApi(this._storageProvider, logger.getLogger("SubscriberApi"));
	}

	public get managementApi() { return this._managementApi; }
	public get publisherApi() { return this._publisherApi; }
	public get subscriberApi() { return this._subscriberApi; }

	protected async onInit(cancellationToken: CancellationToken): Promise<void> {
		await Initable.initAll(cancellationToken, this._managementApi, this._publisherApi, this._subscriberApi);
	}

	protected async onDispose(): Promise<void> {
		await Disposable.disposeAll(this._subscriberApi, this._publisherApi, this._managementApi);
	}
}

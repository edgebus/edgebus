import { CancellationToken } from "@zxteam/contract";
import { Initable, Disposable } from "@zxteam/disposable";
import { Inject, Provides, Singleton } from "@zxteam/launcher";
import logger from "@zxteam/logger";

// Providers
import { ConfigurationProvider } from "./ConfigurationProvider";
import { StorageProvider } from "./StorageProvider";

// APIs
import { ManagementApi } from "../api/ManagementApi";

@Singleton
export abstract class ApiProvider extends Initable {
	abstract get managementApi(): ManagementApi;
}

@Provides(ApiProvider)
class ApiProviderImpl extends ApiProvider {
	@Inject
	private readonly _configProvider!: ConfigurationProvider;

	@Inject
	private readonly _storageProvider!: StorageProvider;


	private readonly _managementApi: ManagementApi;

	public constructor() {
		super();

		const apiLog = logger.getLogger("ManagementApi");
		this._managementApi = new ManagementApi(apiLog);
	}

	public get managementApi() { return this._managementApi; }

	protected async onInit(cancellationToken: CancellationToken): Promise<void> {
		const managmentApi = this._managementApi;

		await Initable.initAll(cancellationToken, managmentApi);
	}

	protected async onDispose(): Promise<void> {
		await Disposable.disposeAll(this._managementApi);
	}
}

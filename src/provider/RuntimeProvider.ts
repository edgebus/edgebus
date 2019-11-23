import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable, Disposable } from "@zxteam/disposable";
import { Inject, Provides, Singleton } from "@zxteam/launcher";
import logger from "@zxteam/logger";

import { StorageProvider } from "../provider/StorageProvider";
import { ConfigurationProvider } from "./ConfigurationProvider";
import { HostingProvider } from "./HostingProvider";
import { EndpointsProvider } from "./EndpointsProvider";


@Singleton
export abstract class RuntimeProvider extends Initable {
	protected readonly log: Logger;

	public constructor() {
		super();
		this.log = logger.getLogger("Runtime");
		if (this.log.isDebugEnabled) {
			this.log.debug(`Implementation: ${this.constructor.name}`);
		}
	}
}

@Provides(RuntimeProvider)
class RuntimeProviderImpl extends RuntimeProvider {
	@Inject
	private readonly configProvider!: ConfigurationProvider;

	@Inject
	private readonly hostingRuntime!: HostingProvider;

	@Inject
	private readonly endpointsRuntime!: EndpointsProvider;

	@Inject
	private readonly storageProvider!: StorageProvider;

	public constructor() {
		super();
	}

	protected async onInit(cancellationToken: CancellationToken): Promise<void> {
		const endpointsService = this.endpointsRuntime;
		const hostingService = this.hostingRuntime;
		const storageProvider = this.storageProvider;

		await Initable.initAll(cancellationToken, storageProvider, endpointsService, hostingService);
	}

	protected async onDispose(): Promise<void> {
		await Disposable.disposeAll(this.endpointsRuntime, this.hostingRuntime, this.storageProvider);
	}
}

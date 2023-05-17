import { FExecutionContext } from "@freemework/common";

import { Provides } from "typescript-ioc";

import { ProviderLocator } from "../provider_locator";
import { SetupService, SetupServiceImpl } from "../service/setup_service";
import { ApiProvider } from "./api_provider";
import { Settings } from "../settings";


export abstract class SetupServiceProvider implements SetupService {
	public abstract setup(executionContext: FExecutionContext, setupSettings: Settings.Setup): Promise<void>;
}

@Provides(SetupServiceProvider)
/**
 * The adapter class implements DI Provider + Settings
 */
export class SetupServiceProviderImpl extends SetupServiceProvider {
	public constructor() {
		super();
		const apiProvider = ProviderLocator.default.get(ApiProvider);

		this._wrap = new SetupServiceImpl(apiProvider.managementApi);
	}

	public setup(executionContext: FExecutionContext, setupSettings: Settings.Setup): Promise<void> {
		return this._wrap.setup(executionContext, setupSettings);
	}

	private readonly _wrap: SetupService;
}

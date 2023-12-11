import { FExecutionContext } from "@freemework/common";

import { Provides } from "typescript-ioc";

import { ProviderLocator } from "../provider_locator";
import { SetupService, SetupServiceImpl } from "../service/setup_service";
import { Settings } from "../settings";
import { ManagementApiProvider } from "./management_api_provider";


export abstract class SetupServiceProvider {
	public abstract setup(executionContext: FExecutionContext, setupSettings: Settings.Setup): Promise<boolean>;
}

@Provides(SetupServiceProvider)
/**
 * The adapter class implements DI Provider + Settings
 */
export class SetupServiceProviderImpl extends SetupServiceProvider {
	public constructor() {
		super();
		this._managementApiProvider = ProviderLocator.default.get(ManagementApiProvider);
		this._wrap = new SetupServiceImpl();
	}

	public async setup(executionContext: FExecutionContext, setupSettings: Settings.Setup): Promise<boolean> {
		return await this._managementApiProvider.using(
			executionContext,
			async (managementApi) => {
				const wasChanged: boolean = await this._wrap.setup(executionContext, managementApi, setupSettings);
				await managementApi.persist(executionContext);
				return wasChanged;
			}
		);
	}

	private readonly _wrap: SetupService;
	private readonly _managementApiProvider: ManagementApiProvider;
}

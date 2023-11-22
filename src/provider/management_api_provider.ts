import { FDisposable, FExecutionContext, FInitable, FInitableBase, FLogger, FUsing } from "@freemework/common";

import { Provides, Singleton } from "typescript-ioc";

import { ManagementApi } from "../api/management_api";

import { StorageProvider } from "./storage_provider";
import { ProviderLocator } from "../provider_locator";
import { DatabaseFactory } from "../data/database_factory";
import { MessageBusProvider } from "./message_bus_provider";
import { MessageBus } from "../messaging/message_bus";

export abstract class UsingProvider<TResource extends FInitable> {
	public using<TResult>(
		executionContext: FExecutionContext,
		worker: (resource: TResource) => Promise<TResult>
	): Promise<TResult> {
		return FUsing(executionContext, () => this.create(), worker);
	}

	protected abstract create(): TResource;
}


@Singleton
export abstract class ManagementApiProvider extends UsingProvider<ManagementApi> {
}

@Provides(ManagementApiProvider)
class ManagementApiProviderImpl extends ManagementApiProvider {
	private readonly _databaseFactory: DatabaseFactory;
	private readonly _messageBus: MessageBus;

	public constructor() {
		super();

		this._databaseFactory = ProviderLocator.default.get(StorageProvider).databaseFactory;
		this._messageBus = ProviderLocator.default.get(MessageBusProvider).wrapAsynchronous;
	}

	protected create(): ManagementApi {
		return new ManagementApi(this._databaseFactory, this._messageBus);
	}
}

import { FLogger, FInitableBase, FExecutionContext, FExceptionInvalidOperation } from "@freemework/common";
import { Provides, Singleton } from "typescript-ioc";

import * as _ from "lodash";

import { MessageBus } from "../messaging/message_bus";
import { MessageBusBull } from "../messaging/message_bus_bull";
import { MessageBusLocal } from "../messaging/message_bus_local";

import { SettingsProvider } from "./settings_provider";
import { DatabaseFactory } from "../data/database_factory";
import { StorageProvider } from "./storage_provider";
import { ProviderLocator } from "../provider_locator";
import { Settings } from "../settings";
import { MessageBusLocalSynchronous } from "../messaging/message_bus_local.synchronous";

@Singleton
export abstract class MessageBusProvider extends FInitableBase {
	protected readonly log: FLogger;

	public abstract get wrapSynchronous(): MessageBus;

	public abstract get wrapAsynchronous(): MessageBus;

	public constructor() {
		super();
		this.log = FLogger.create("MessageBus");
		if (this.log.isDebugEnabled) {
			this.log.debug(FExecutionContext.Empty, `Implementation: ${this.constructor.name}`);
		}
	}
}

@Provides(MessageBusProvider)
export class MessageBusProviderImpl extends MessageBusProvider {
	public get wrapSynchronous() { return this._synchronousMessageBus; }

	public get wrapAsynchronous() { return this._asynchronousMessageBus; }

	public constructor() {
		super();

		const settingsProvider: SettingsProvider = ProviderLocator.default.get(SettingsProvider);
		const storageProvider: StorageProvider = ProviderLocator.default.get(StorageProvider);

		const storage: DatabaseFactory = storageProvider.databaseFactory;

		const asynchronousMessageBusSettings: Settings.MessageBus = settingsProvider.messageBusAsynchronous;
		switch (asynchronousMessageBusSettings.kind) {
			case "bull":
				this._asynchronousMessageBus = new MessageBusBull(
					storage,
					asynchronousMessageBusSettings.redisUrl,
				);
				break;
			case "local":
				this._asynchronousMessageBus = new MessageBusLocal(
					storage,
					{
						deliveryPolicy: {
							type: MessageBus.DeliveryPolicy.Type.SEQUENCE,
							retryOpts: "TBD"
						}
					});
				break;
			default:
				throw new FExceptionInvalidOperation(`Not supported message bus kind '${(asynchronousMessageBusSettings as any).kind}'.`);
		}

		const synchronousMessageBusSettings: Settings.MessageBus = settingsProvider.messageBusSynchronous;
		switch (synchronousMessageBusSettings.kind) {
			case "local":
				this._synchronousMessageBus = new MessageBusLocalSynchronous(storage);
				break;
			default:
				throw new FExceptionInvalidOperation(`Not supported message bus kind '${(synchronousMessageBusSettings as any).kind}'.`);
		}
	}

	protected async onInit() {
		await this._asynchronousMessageBus.init(this.initExecutionContext);
		await this._synchronousMessageBus.init(this.initExecutionContext);
	}

	protected async onDispose() {
		await this._asynchronousMessageBus.dispose();
		await this._synchronousMessageBus.dispose();
	}

	private readonly _asynchronousMessageBus: MessageBus;
	private readonly _synchronousMessageBus: MessageBus;
}

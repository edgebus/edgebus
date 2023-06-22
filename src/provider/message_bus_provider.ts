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

@Singleton
export abstract class MessageBusProvider extends FInitableBase {
	protected readonly log: FLogger;

	public abstract get wrap(): MessageBus;

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
	public get wrap() { return this._messageBus; }

	public constructor() {
		super();

		const settingsProvider: SettingsProvider = ProviderLocator.default.get(SettingsProvider);
		const storageProvider: StorageProvider = ProviderLocator.default.get(StorageProvider);

		const storage: DatabaseFactory = storageProvider.databaseFactory;

		const messageBusSettings: Settings.MessageBus = settingsProvider.messageBus;
		switch (messageBusSettings.kind) {
			case "bull":
				this._messageBus = new MessageBusBull(
					storage,
					messageBusSettings.redisUrl,
				);
				break;
			case "local":
				this._messageBus = new MessageBusLocal(
					storage,
					{
						deliveryPolicy: {
							type: MessageBus.DeliveryPolicy.Type.SEQUENCE,
							retryOpts: "TBD"
						}
					});
				break;
			default:
				throw new FExceptionInvalidOperation(`Not supported message bus kind '${(messageBusSettings as any).kind}'.`);
		}
	}

	protected async onInit() {
		await this._messageBus.init(this.initExecutionContext);
	}

	protected async onDispose() {
		await this._messageBus.dispose();
	}

	private readonly _messageBus: MessageBus;
}

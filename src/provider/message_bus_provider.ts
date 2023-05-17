import { FLogger, FCancellationToken, FInitableBase, FExecutionContext } from "@freemework/common";
import { Container, Provides } from "typescript-ioc";

import * as _ from "lodash";

import { MessageBus } from "../messaging/message_bus";
import { MessageBusLocal } from "../messaging/message_bus_local";
import { MessageBusRabbitMQ } from "../messaging/message_bus_rabbitmq";
import { Message } from "../model/message";
import { Topic } from "../model/topic";

import { SettingsProvider } from "./settings_provider";
import { EgressApiIdentifier, IngressApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";
import { DatabaseFactory } from "../data/database_factory";
import { StorageProvider } from "./storage_provider";
import { ProviderLocator } from "../provider_locator";

export abstract class MessageBusProvider extends FInitableBase implements MessageBus {
	protected readonly log: FLogger;

	public constructor() {
		super();
		this.log = FLogger.create("MessageBus");
		if (this.log.isDebugEnabled) {
			this.log.debug(FExecutionContext.Empty, `Implementation: ${this.constructor.name}`);
		}
	}

	public publish(
		executionContext: FExecutionContext,
		ingressId: IngressApiIdentifier,
		message: Message
	): Promise<void> {
		return this.messageBus.publish(executionContext, ingressId, message);
	}

	public retainChannel(
		executionContext: FExecutionContext,
		topicId: TopicApiIdentifier,
		egressId: EgressApiIdentifier
	): Promise<MessageBus.Channel> {
		return this.messageBus.retainChannel(executionContext, topicId, egressId);
	}

	protected abstract get messageBus(): MessageBus;
}

@Provides(MessageBusProvider)
class MessageBusProviderImpl extends MessageBusProvider {
	private readonly _messageBus: MessageBusLocal;

	public constructor() {
		super();

		const configProvider: SettingsProvider = ProviderLocator.default.get(SettingsProvider);
		const storageProvider: StorageProvider = ProviderLocator.default.get(StorageProvider);

		const storage: DatabaseFactory = storageProvider.databaseFactory;

		//const rabbitUrl: URL = this.configProvider.rabbit.url;
		//const rabbitSsl: Settings.SSL = this.configProvider.rabbit.ssl;

		this._messageBus = new MessageBusLocal(
			storage,
			{
				// url: rabbitUrl,
				// ssl: rabbitSsl,
				deliveryPolicy: {
					type: MessageBus.DeliveryPolicy.Type.SEQUENCE,
					retryOpts: "TBD"
				}
			});
	}

	protected get messageBus() { return this._messageBus; }

	protected async onInit() {
		await this._messageBus.init(this.initExecutionContext);
	}

	protected async onDispose() {
		await this._messageBus.dispose();
	}
}

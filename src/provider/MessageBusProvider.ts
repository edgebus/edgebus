import { FLogger, FCancellationToken, FInitableBase, FExecutionContext } from "@freemework/common";
import { Container, Provides } from "typescript-ioc";

import * as _ from "lodash";

import { Configuration } from "../Configuration";

import { ConfigurationProvider } from "./ConfigurationProvider";
import { MessageBus } from "../messaging/MessageBus";
import { MessageBusRabbitMQ } from "../messaging/MessageBusRabbitMQ";
import { Topic } from "../model/Topic";
import { Message } from "../model/Message";
import { MessageBusLocal } from "../messaging/MessageBusLocal";

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
		executionContext: FExecutionContext, topicName: Topic["topicName"], message: Message
	): Promise<void> {
		return this.messageBus.publish(executionContext, topicName, message);
	}

	public retainChannel(executionContext: FExecutionContext, topicName: string, subscriberId: string): Promise<MessageBus.Channel> {
		return this.messageBus.retainChannel(executionContext, topicName, subscriberId);
	}

	protected abstract get messageBus(): MessageBus;
}

@Provides(MessageBusProvider)
class MessageBusProviderImpl extends MessageBusProvider {
	// Do not use Inject inside providers to prevents circular dependency
	private readonly _configProvider: ConfigurationProvider;

	private readonly _messageBus: MessageBusLocal;

	public constructor() {
		super();

		this._configProvider = Container.get(ConfigurationProvider);

		//const rabbitUrl: URL = this.configProvider.rabbit.url;
		//const rabbitSsl: Configuration.SSL = this.configProvider.rabbit.ssl;

		this._messageBus = new MessageBusLocal({
			// url: rabbitUrl,
			// ssl: rabbitSsl
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

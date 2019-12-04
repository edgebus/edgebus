import { Logger, CancellationToken } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { Inject, Provides } from "@zxteam/launcher";
import { logger } from "@zxteam/logger";

import * as _ from "lodash";

import { Configuration } from "../Configuration";

import { ConfigurationProvider } from "./ConfigurationProvider";
import { MessageBus } from "../messaging/MessageBus";
import { MessageBusRabbitMQ } from "../messaging/MessageBusRabbitMQ";
import { Topic } from "../model/Topic";
import { Message } from "../model/Message";
import { MessageBusLocal } from "../messaging/MessageBusLocal";

export abstract class MessageBusProvider extends Initable implements MessageBus {

	protected readonly log: Logger;

	public constructor() {
		super();
		this.log = logger.getLogger("MessageBus");
		if (this.log.isDebugEnabled) {
			this.log.debug(`Implementation: ${this.constructor.name}`);
		}
	}

	public abstract get messageBus(): MessageBus;

	public markChannelForDestory(cancellationToken: CancellationToken, topicName: string, subscriberId: string): Promise<void> {
		return this.messageBus.markChannelForDestory(cancellationToken, topicName, subscriberId);
	}

	public publish(
		cancellationToken: CancellationToken, topicName: Topic["topicName"], message: Message
	): Promise<void> {
		return this.messageBus.publish(cancellationToken, topicName, message);
	}

	public retainChannel(cancellationToken: CancellationToken, topicName: string, subscriberId: string): Promise<MessageBus.Channel> {
		return this.messageBus.retainChannel(cancellationToken, topicName, subscriberId);
	}

}

@Provides(MessageBusProvider)
class MessageBusProviderImpl extends MessageBusProvider {
	@Inject
	private readonly configProvider!: ConfigurationProvider;

	private readonly _messageBus: MessageBusLocal;

	public constructor() {
		super();

		//const rabbitUrl: URL = this.configProvider.rabbit.url;
		//const rabbitSsl: Configuration.SSL = this.configProvider.rabbit.ssl;

		this._messageBus = new MessageBusLocal({
			// url: rabbitUrl,
			// ssl: rabbitSsl
		});
	}

	public get messageBus() { return this._messageBus; }

	protected async onInit(cancellationToken: CancellationToken) {
		await this._messageBus.init(cancellationToken);
	}

	protected async onDispose() {
		await this._messageBus.dispose();
	}
}

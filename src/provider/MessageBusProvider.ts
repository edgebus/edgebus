import { Logger, CancellationToken } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { Inject, Provides } from "@zxteam/launcher";
import { logger } from "@zxteam/logger";

import * as _ from "lodash";

import { Configuration } from "../Configuration";

import { ConfigurationProvider } from "./ConfigurationProvider";
import { MessageBus } from "../messaging/MessageBus";
import { MessageBusRabbitMQ } from "../messaging/MessageBusRabbitMQ";

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

	public publish(data: any): Promise<void> { return this.messageBus.publish(data); }
}

@Provides(MessageBusProvider)
class MessageBusProviderImpl extends MessageBusProvider {
	@Inject
	private readonly configProvider!: ConfigurationProvider;

	private readonly _messageBus: MessageBusRabbitMQ;

	public constructor() {
		super();

		//const rabbitUrl: URL = this.configProvider.rabbit.url;
		//const rabbitSsl: Configuration.SSL = this.configProvider.rabbit.ssl;

		this._messageBus = new MessageBusRabbitMQ({
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

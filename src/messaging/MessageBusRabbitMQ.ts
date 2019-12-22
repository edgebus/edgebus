import { CancellationToken } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";

import { MessageBus } from "./MessageBus";

import { Message } from "../model/Message";
import { Topic } from "../model/Topic";
import { Subscriber } from "../model/Subscriber";

export class MessageBusRabbitMQ extends Initable implements MessageBus {
	public constructor(opts: MessageBusRabbitMQ.Opts) {
		super();

		// TODO
	}

	public async publish(
		cancellationToken: CancellationToken, topicName: Topic["topicName"], message: Message
	): Promise<void> {
		throw new InvalidOperationError("Not implemented yet");
	}

	public async retainChannel(
		cancellationToken: CancellationToken, topicName: Topic["topicName"], subscriberId: Subscriber["subscriberId"]
	): Promise<MessageBus.Channel> {
		throw new InvalidOperationError("Not implemented yet");
	}

	protected onInit(cancellationToken: CancellationToken): void | Promise<void> {
		// TODO
	}

	protected onDispose(): void | Promise<void> {
		// TODO
	}
}

export namespace MessageBusRabbitMQ {
	export interface Opts {
		// TODO
	}
}

import { FExceptionInvalidOperation, FExecutionContext, FInitableBase } from "@freemework/common";

import { MessageBus } from "./MessageBus";

import { Message } from "../model/Message";
import { Topic } from "../model/Topic";
import { Subscriber } from "../model/Subscriber";

export class MessageBusRabbitMQ extends FInitableBase implements MessageBus {
	public constructor(opts: MessageBusRabbitMQ.Opts) {
		super();

		// TODO
	}

	public async publish(
		executionContext: FExecutionContext, topicName: Topic["topicName"], message: Message
	): Promise<void> {
		throw new FExceptionInvalidOperation("Not implemented yet");
	}

	public async retainChannel(
		executionContext: FExecutionContext, topicName: Topic["topicName"], subscriberId: Subscriber["subscriberId"]
	): Promise<MessageBus.Channel> {
		throw new FExceptionInvalidOperation("Not implemented yet");
	}

	protected onInit(): void | Promise<void> {
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

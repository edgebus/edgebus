import { FExceptionInvalidOperation, FExecutionContext, FInitableBase } from "@freemework/common";

import { Message } from "../model/message";
import { Topic } from "../model/topic";

import { MessageBus } from "./message_bus";
import { MessageBusBase } from "./message_bus_base";
import { EgressApiIdentifier, IngressApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";
import { DatabaseFactory } from "../data/database_factory";

export class MessageBusRabbitMQ extends MessageBusBase {
	public constructor(storage: DatabaseFactory, opts: MessageBusRabbitMQ.Opts) {
		super(storage);

		// TODO
	}

	protected async onPublish(
		executionContext: FExecutionContext,
		ingressId: IngressApiIdentifier,
		topicName: Topic["topicName"],
		message: Message.Id & Message.Data
	): Promise<void> {
		throw new FExceptionInvalidOperation("Not implemented yet");
	}

	protected async onRetainChannel(
		executionContext: FExecutionContext,
		topicId: TopicApiIdentifier,
		topicName: Topic["topicName"],
		egressId: EgressApiIdentifier
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

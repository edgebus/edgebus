import { FExceptionInvalidOperation, FExecutionContext, FInitableBase } from "@freemework/common";

import { Message } from "../model/message";
import { Topic } from "../model/topic";

import { MessageBus } from "./message_bus";
import { MessageBusBase } from "./message_bus_base";
import { EgressApiIdentifier, IngressApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";
import { DatabaseFactory } from "../data/database_factory";
import { Ingress } from "../model/ingress";
import { Egress } from "../model/egress";

export class MessageBusRabbitMQ extends MessageBusBase {
	public constructor(storage: DatabaseFactory, opts: MessageBusRabbitMQ.Opts) {
		super(storage);

		// TODO
	}

	protected async onPublish(
		executionContext: FExecutionContext,
		ingress: Ingress,
		topic: Topic,
		message: Message.Id & Message.Data
	): Promise<void> {
		throw new FExceptionInvalidOperation("Not implemented yet");
	}

	protected async onRegisterEgress(
		executionContext: FExecutionContext,
		egress: Egress
	): Promise<void> {
		throw new FExceptionInvalidOperation("Not implemented yet");
	}

	protected async onRegisterTopic(
		executionContext: FExecutionContext,
		topic: Topic
	): Promise<void> {
		throw new FExceptionInvalidOperation("Not implemented yet");
	}
	protected async onRetainChannel(
		executionContext: FExecutionContext,
		topic: Topic,
		egress: Egress
	): Promise<MessageBus.Channel> {
		throw new FExceptionInvalidOperation("Not implemented yet");
	}

	protected async onInit(): Promise<void> {
		await super.onInit();
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

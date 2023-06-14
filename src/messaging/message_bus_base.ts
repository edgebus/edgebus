import { FExecutionContext, FInitableBase } from "@freemework/common";

import { DatabaseFactory } from "../data/database_factory";
import { EgressApiIdentifier, IngressApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";
import { Message } from "../model/message";
import { MessageBus } from "./message_bus";
import { Topic } from "../model/topic";
import { Ingress } from "../model/ingress";
import { Egress } from "../model/egress";

export abstract class MessageBusBase extends MessageBus {
	public constructor(
		protected readonly storage: DatabaseFactory
	) {
		super();
	}

	public async publish(
		executionContext: FExecutionContext,
		ingressId: IngressApiIdentifier, message: Message.Id & Message.Data
	): Promise<void> {
		await this.storage.using(
			executionContext,
			async (db) => {
				const topic: Topic = await db.getTopic(executionContext, { ingressId });
				const ingress: Ingress = await db.getIngress(executionContext, { ingressId });
				await db.createMessage(
					executionContext, ingressId,
					message.messageId, message.headers,
					message.mediaType, message.ingressBody,
					message.body
				);
				await this.onPublish(
					executionContext, ingress,
					topic, message
				);
			}
		);
	}

	public async registerEgress(
		executionContext: FExecutionContext,
		egressId: EgressApiIdentifier
	): Promise<void> {
		await this.storage.using(
			executionContext,
			async (db) => {
				const egress: Egress = await db.getEgress(executionContext, { egressId });
				await this.onRegisterEgress(executionContext, egress);
			}
		);
	}

	public async registerTopic(
		executionContext: FExecutionContext,
		topicId: TopicApiIdentifier
	): Promise<void> {
		await this.storage.using(
			executionContext,
			async (db) => {
				const topic: Topic = await db.getTopic(executionContext, { topicId });
				await this.onRegisterTopic(executionContext, topic);
			}
		);
	}

	public async retainChannel(
		executionContext: FExecutionContext,
		topicId: TopicApiIdentifier,
		egressId: EgressApiIdentifier
	): Promise<MessageBus.Channel> {
		return await this.storage.using(
			executionContext,
			async (db) => {
				const topic: Topic = await db.getTopic(executionContext, { topicId });
				const egress: Egress = await db.getEgress(executionContext, { egressId });
				return await this.onRetainChannel(executionContext, topic, egress);
			}
		);
	}

	protected abstract onPublish(
		executionContext: FExecutionContext,
		ingress: Ingress,
		topic: Topic,
		message: Message.Id & Message.Data
	): Promise<void>;

	protected abstract onRegisterEgress(
		executionContext: FExecutionContext,
		egress: Egress
	): Promise<void>;

	protected abstract onRegisterTopic(
		executionContext: FExecutionContext,
		topic: Topic
	): Promise<void>;

	protected abstract onRetainChannel(
		executionContext: FExecutionContext,
		topic: Topic,
		egress: Egress
	): Promise<MessageBus.Channel>;
}

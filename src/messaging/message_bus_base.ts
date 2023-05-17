import { FExecutionContext, FInitableBase } from "@freemework/common";

import { DatabaseFactory } from "../data/database_factory";
import { EgressApiIdentifier, IngressApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";
import { Message } from "../model/message";
import { MessageBus } from "./message_bus";
import { Topic } from "../model/topic";

export abstract class MessageBusBase extends FInitableBase implements MessageBus {
	public constructor(
		private readonly _storage: DatabaseFactory
	) {
		super();
	}

	public async publish(executionContext: FExecutionContext, ingressId: IngressApiIdentifier, message: Message.Id & Message.Data): Promise<void> {
		await this._storage.using(
			executionContext,
			async (db) => {
				const topic: Topic = await db.getTopic(executionContext, { ingressId });
				await db.createMessage(executionContext, ingressId, message.messageId, message.headers, message.mediaType, message.ingressBody);
				await this.onPublish(executionContext, ingressId, topic.topicName, message);
			}
		);
	}
	public async retainChannel(executionContext: FExecutionContext, topicId: TopicApiIdentifier, egressId: EgressApiIdentifier): Promise<MessageBus.Channel> {
		return await this._storage.using(
			executionContext,
			async (db) => {
				const topic: Topic = await db.getTopic(executionContext, { topicId });
				return await this.onRetainChannel(executionContext, topicId, topic.topicName, egressId);
			}
		);
	}

	protected abstract onPublish(
		executionContext: FExecutionContext,
		ingressId: IngressApiIdentifier,
		topicName: Topic["topicName"],
		message: Message.Id & Message.Data
	): Promise<void>;

	protected abstract onRetainChannel(
		executionContext: FExecutionContext,
		topicId: TopicApiIdentifier,
		topicName: Topic["topicName"],
		egressId: EgressApiIdentifier
	): Promise<MessageBus.Channel>;
}

import { CancellationToken } from "@zxteam/contract";
import { Disposable, Initable } from "@zxteam/contract";

import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";
import { Publisher } from "../model/Publisher";
import { Subscriber } from "../model/Subscriber";

export interface PersistentStorage extends Initable {
	addTopic(
		cancellationToken: CancellationToken,
		topicData: Topic.Name & Topic.Security & Publisher.Security & Subscriber.Security
	): Promise<Topic>;

	deleteTopic(cancellationToken: CancellationToken,
		topicData: Topic.Name & Topic.Security
	): Promise<void>;


	getAvailableTopics(
		cancellationToken: CancellationToken
	): Promise<Topic[]>;

	addSubscriberWebhook(
		cancellationToken: CancellationToken,
		topic: Topic.Name & Subscriber.Security,
		webhookData: Webhook.Data
	): Promise<Webhook>;

	getSubscriberWebhook(webhook: Webhook.Id["webhookId"]): Promise<Webhook>;

	removeSubscriberWebhook(
		cancellationToken: CancellationToken,
		webhookId: Webhook.Id["webhookId"]
	): Promise<void>;
}

export class NoRecordPersistentStorageError extends Error {
	public readonly name = "NoRecordPersistentStorageError";
}

export class ForbiddenPersistentStorageError extends Error {
	public readonly name = "ForbiddenPersistentStorageError";
}

export class BadRequestPersistentStorageError extends Error {
	public readonly name = "BadRequestPersistentStorageError";
}


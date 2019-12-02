import { CancellationToken } from "@zxteam/contract";
import { Disposable, Initable } from "@zxteam/contract";

import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";

export interface PersistentStorage extends Initable {
	addTopic(
		cancellationToken: CancellationToken,
		topicData: Topic.Data & Topic.TopicSecurity & Topic.PublisherSecurity & Topic.SubscriberSecurity
	): Promise<Topic>;

	getAvailableTopics(
		cancellationToken: CancellationToken
	): Promise<Topic[]>;

	addSubscriberWebhook(
		cancellationToken: CancellationToken,
		webhookData: Webhook.Data
	): Promise<Webhook.Id>;

	getSubscriberWebhook(webhook: Webhook.Id["webhookId"]): Promise<Webhook>;

	removeSubscriberWebhook(
		cancellationToken: CancellationToken,
		webhookId: Webhook.Id["webhookId"]
	): Promise<void>;
}

export const enum Table {
	TOPIC = "topic",
	SUBCRIBER_WEBHOOK = "subscriber_webhook"
}

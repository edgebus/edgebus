import { CancellationToken } from "@zxteam/contract";
import { Initable } from "@zxteam/contract";

import { Publisher } from "../model/Publisher";
import { Subscriber } from "../model/Subscriber";
import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";
import { Security } from "../model/Security";

export interface PersistentStorage extends Initable {
	addTopic(
		cancellationToken: CancellationToken,
		topicData: Topic.Data & Topic.Security & Publisher.Security & Subscriber.Security
	): Promise<Topic>;

	addPublisherHttp(
		cancellationToken: CancellationToken,
		topicData: Topic.Name & { sslOption: Publisher.Data["sslOption"] }
	): Promise<Publisher>;

	deleteTopic(cancellationToken: CancellationToken,
		topicData: Topic.Name & Topic.Security
	): Promise<void>;

	addSubscriberWebhook(
		cancellationToken: CancellationToken,
		topicName: Topic.Name["topicName"],
		webhookData: Webhook.Data
	): Promise<Webhook>;

	getSubscriberWebhook(cancellationToken: CancellationToken, webhook: Webhook.Id["webhookId"]): Promise<Webhook>;

	getTopicByWebhookId(cancellationToken: CancellationToken, webhook: Webhook.Id["webhookId"]): Promise<Topic>;

	getTopicByName(cancellationToken: CancellationToken, topicName: Topic.Name["topicName"]): Promise<Topic>;

	getAvailableWebhooks(cancellationToken: CancellationToken, subscriberSecurity: Security): Promise<Array<Webhook>>;

	removeSubscriberWebhook(
		cancellationToken: CancellationToken,
		webhookId: Webhook.Id["webhookId"]
	): Promise<void>;
}


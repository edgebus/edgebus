import { CancellationToken } from "@zxteam/contract";
import { Initable } from "@zxteam/contract";

import { PublisherSecurity } from "../model/PublisherSecurity";
import { Subscriber } from "../model/Subscriber";
import { SubscriberSecurity } from "../model/SubscriberSecurity";
import { TopicSecurity } from "../model/TopicSecurity";
import { Security } from "../model/Security";
import { Topic } from "../model/Topic";

export interface PersistentStorage extends Initable {
	addTopic(
		cancellationToken: CancellationToken,
		topicData: Topic.Data & TopicSecurity & PublisherSecurity & SubscriberSecurity
	): Promise<Topic>;

	// addPublisherHttp(
	// 	cancellationToken: CancellationToken,
	// 	topicData: Topic.Name & { sslOption: Publisher.Data["sslOption"] }
	// ): Promise<Publisher>;

	deleteTopic(cancellationToken: CancellationToken,
		topicData: Topic.Name & TopicSecurity
	): Promise<void>;

	addSubscriberWebhook(
		cancellationToken: CancellationToken,
		topicName: Topic.Name["topicName"],
		webhookData: Subscriber.Webhook
	): Promise<Subscriber<Subscriber.Webhook>>;

	getSubscriber(
		cancellationToken: CancellationToken,
		subscriberId: Subscriber["subscriberId"]
	): Promise<Subscriber>;

	getTopicBySubscriber(
		cancellationToken: CancellationToken,
		subscriberId: Subscriber["subscriberId"]
	): Promise<Topic>;

	getTopicByName(
		cancellationToken: CancellationToken,
		topicName: Topic.Name["topicName"]
	): Promise<Topic>;

	removeSubscriber(
		cancellationToken: CancellationToken,
		subscriberId: Subscriber["subscriberId"]
	): Promise<void>;
}


import { CancellationToken } from "@zxteam/contract";
import { Initable } from "@zxteam/contract";

import { Publisher } from "../model/Publisher";
import { Subscriber } from "../model/Subscriber";
import { Topic } from "../model/Topic";
import { Security } from "../model/Security";

export interface PersistentStorage extends Initable {

	createPublisher<TDataVariant extends Publisher.DataVariant>(
		cancellationToken: CancellationToken,
		publisherSecurity: Security,
		variant: TDataVariant
	): Promise<Publisher<TDataVariant>>;

	createSubscriber<TDataVariant extends Subscriber.DataVariant>(
		cancellationToken: CancellationToken,
		subscriberSecurity: Security,
		variant: TDataVariant
	): Promise<Subscriber<TDataVariant>>;

	createTopic(
		cancellationToken: CancellationToken,
		topicSecurity: Security,
		topicData: Topic.Id & Topic.Data
	): Promise<Topic>;

	listTopics(
		cancellationToken: CancellationToken,
		domain: string | null
	): Promise<Array<Topic>>;

	// getSubscriber(
	// 	cancellationToken: CancellationToken,
	// 	subscriberId: Subscriber["subscriberId"]
	// ): Promise<Subscriber>;

	// getTopic(
	// 	cancellationToken: CancellationToken,
	// 	topic: Topic.Id
	// ): Promise<Topic>;

	// getTopicBySubscriber(
	// 	cancellationToken: CancellationToken,
	// 	subscriberId: Subscriber["subscriberId"]
	// ): Promise<Topic>;

	// removePublish(
	// 	cancellationToken: CancellationToken,
	// 	publisherId: Publisher["publisherId"]
	// ): Promise<void>;

	// removeSubscriber(
	// 	cancellationToken: CancellationToken,
	// 	subscriberId: Subscriber["subscriberId"]
	// ): Promise<void>;

	// removeTopic(
	// 	cancellationToken: CancellationToken,
	// 	topic: Topic.Id
	// ): Promise<void>;
}


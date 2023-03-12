import { FExecutionContext, FInitableBase } from "@freemework/common";

import { Publisher } from "../model/publisher";
import { Subscriber } from "../model/subscriber";
import { Topic } from "../model/topic";
import { Security } from "../model/security";

export interface PersistentStorage extends FInitableBase {

	createPublisher<TDataVariant extends Publisher.DataVariant>(
		executionContext: FExecutionContext,
		publisherSecurity: Security,
		variant: TDataVariant
	): Promise<Publisher<TDataVariant>>;

	createSubscriber<TDataVariant extends Subscriber.DataVariant>(
		executionContext: FExecutionContext,
		subscriberSecurity: Security,
		variant: TDataVariant
	): Promise<Subscriber<TDataVariant>>;

	createTopic(
		executionContext: FExecutionContext,
		topicSecurity: Security,
		topicData: Topic.Id & Topic.Data
	): Promise<Topic>;

	listTopics(
		executionContext: FExecutionContext,
		domain: string | null
	): Promise<Array<Topic>>;

	savePublisherMessage(
		executionContext: FExecutionContext,
	): Promise<void>

	// getSubscriber(
		// executionContext: FExecutionContext,
	// 	subscriberId: Subscriber["subscriberId"]
	// ): Promise<Subscriber>;

	// getTopic(
		// executionContext: FExecutionContext,
	// 	topic: Topic.Id
	// ): Promise<Topic>;

	// getTopicBySubscriber(
		// executionContext: FExecutionContext,
	// 	subscriberId: Subscriber["subscriberId"]
	// ): Promise<Topic>;

	// removePublish(
		// executionContext: FExecutionContext,
	// 	publisherId: Publisher["publisherId"]
	// ): Promise<void>;

	// removeSubscriber(
		// executionContext: FExecutionContext,
	// 	subscriberId: Subscriber["subscriberId"]
	// ): Promise<void>;

	// removeTopic(
		// executionContext: FExecutionContext,
	// 	topic: Topic.Id
	// ): Promise<void>;
}


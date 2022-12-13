import { FExceptionInvalidOperation, FExecutionContext, FInitableBase, FLogger } from "@freemework/common";

// Models
import { Topic } from "../model/Topic";
import { Subscriber } from "../model/Subscriber";
import { Security } from "../model/Security";

import { PersistentStorage } from "../data/PersistentStorage";

import { UnknownApiError, apiHandledException } from "./errors";

/**
 * Subscriber API allows subscribe/unsubscribe for events via webhooks and other subscriber's type
 */
export class SubscriberApi extends FInitableBase {
	private readonly _log: FLogger;
	private readonly _storage: PersistentStorage;

	constructor(_storage: PersistentStorage, log: FLogger) {
		super();
		this._storage = _storage;
		this._log = log;
	}

	public async list(
		executionContext: FExecutionContext,
		subscriberSecurity: Security
	): Promise<Array<Subscriber>> {
		this._log.debug(`Run subscriberWebhook with subscriberSecurity: ${subscriberSecurity}`);

		// try {
		// 	const webhooks: Array<Subscriber> = await this._storage
		// 		.getAvailableWebhooks(cancellationToken, subscriberSecurity);

		// 	return webhooks;

		// } catch (e) {
		// 	this._log.error(`getAvailableWebhooks Error: ${e.message}`);
		// 	throw apiHandledException(e);
		// }

		throw new FExceptionInvalidOperation("Method does not have implementation yet");
	}

	/**
	 * Subscribe topic as Webhook
	 * @param cancellationToken Allows you to try to cancel execution
	 * @param topicId Describes message source topic (includes topic security)
	 * @param opts Webhook specific options
	 */
	public async subscribeWebhook(
		executionContext: FExecutionContext, topicId: Topic.Id,
		topicSubscriberSecurity: Security, webhookData: Subscriber.Webhook
	): Promise<Subscriber<Subscriber.Webhook>> {

		this._log.debug(`Run subscriberWebhook with topic: ${topicId} and webhookData ${webhookData}`);
		throw new FExceptionInvalidOperation("Not implemented yet");
		// try {
		// 	const topicSubscriberSecurityRecord: Topic = await this._storage
		// 		.getTopicSubscriberSecurity(cancellationToken, topicSubscriberSecurity);

		// 	const subscriberSecurityKind = topicRecord.security.kind;
		// 	const subscriberSecurityToken = topicRecord.security.token;

		// 	if (topicSubscriberSecurity.kind !== subscriberSecurityKind
		// 		|| topicSubscriberSecurity.token !== subscriberSecurityToken) {
		// 		throw new UnknownApiError(`Wrong Subscriber Security Kind or Subscriber Security Token`);
		// 	}

		// 	const webhookId: Subscriber<Subscriber.Webhook> = await this._storage
		// 		.addSubscriberWebhook(cancellationToken, topicId.topicName, webhookData);

		// 	return webhookId;
		// } catch (e) {
		// 	this._log.error(`subscriberWebhook Error: ${e.message}`);
		// 	throw apiHandledException(e);
		// }
	}

	/**
	 * Unsubscribe previously subscribed Webhook
	 * @param cancellationToken Allows you to try to cancel execution
	 * @param webhook Webhook identifier and security
	 * @returns Deleted date
	 */
	public async unsubscribe(
		executionContext: FExecutionContext, subscriber: Subscriber.Id
	): Promise<Date> {
		throw new FExceptionInvalidOperation("Not implemented yet");
		//this._log.debug(`Run subscriberWebhook with webhook: ${webhook}`);

		// try {
		// 	//const topic: Topic = await this._storage.getTopicByWebhookId(cancellationToken, webhook.subscriberId);

		// } catch (e) {
		// 	this._log.error(`unsubscribeWebhook Error: ${e.message}`);
		// 	throw apiHandledException(e);
		// }
	}


	protected async onInit() {
		// nop
	}
	protected async onDispose() {
		// nop
	}
}

export namespace SubscriberApi {
	export type TopicMap = Map<Topic["topicName"], Topic>;
}

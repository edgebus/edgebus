import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";

// Models
import { Topic } from "../model/Topic";
import { Security } from "../model/Security";

import { PersistentStorage } from "../data/PersistentStorage";
import { Subscriber } from "../model/Subscriber";
import { UnknownApiError, apiHandledException } from "./errors";
import { SubscriberSecurity } from "../model/SubscriberSecurity";

/**
 * Subscriber API allows subscribe/unsibscribe for events via webhooks and other subscriber's type
 */
export class SubscriberApi extends Initable {
	private readonly _log: Logger;
	private readonly _storage: PersistentStorage;

	constructor(_storage: PersistentStorage, log: Logger) {
		super();
		this._storage = _storage;
		this._log = log;
	}

	public async list(
		cancellationToken: CancellationToken,
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

		throw new InvalidOperationError("Method does not have implementation yet");
	}

	/**
	 * Subscribe topic as Webhook
	 * @param cancellationToken Allows you to try to cancel execution
	 * @param topic Describes message source topic (includes topic security)
	 * @param opts Webhook specific options
	 */
	public async subscribeWebhook(
		cancellationToken: CancellationToken, topic: Topic.Name, webhookData: Subscriber.Webhook & SubscriberSecurity
	): Promise<Subscriber<Subscriber.Webhook>> {

		this._log.debug(`Run subscriberWebhook with topic: ${topic} and webhookData ${webhookData}`);

		try {
			const topicRecord: Topic = await this._storage.getTopicByName(cancellationToken, topic.topicName);

			const subscriberSecurityKind = topicRecord.subscriberSecurity.kind;
			const subscriberSecurityToken = topicRecord.subscriberSecurity.token;

			if (webhookData.subscriberSecurity.kind !== subscriberSecurityKind
				|| webhookData.subscriberSecurity.token !== subscriberSecurityToken) {
				throw new UnknownApiError(`Wrong Subscriber Security Kind or Subscriber Security Token`);
			}

			const webhookId: Subscriber<Subscriber.Webhook> = await this._storage
				.addSubscriberWebhook(cancellationToken, topic.topicName, webhookData);

			return webhookId;
		} catch (e) {
			this._log.error(`subscriberWebhook Error: ${e.message}`);
			throw apiHandledException(e);
		}
	}

	/**
	 * Unsubscribe previously subscribed Webhook
	 * @param cancellationToken Allows you to try to cancel execution
	 * @param webhook Webhook identifier and security
	 * @returns Deleted date
	 */
	public async unsubscribe(
		cancellationToken: CancellationToken, subscriberInfo: Subscriber.Id & SubscriberSecurity
	): Promise<Date> {
		//this._log.debug(`Run subscriberWebhook with webhook: ${webhook}`);

		try {
			//const topic: Topic = await this._storage.getTopicByWebhookId(cancellationToken, webhook.subscriberId);

		} catch (e) {
			this._log.error(`unsubscribeWebhook Error: ${e.message}`);
			throw apiHandledException(e);
		}
		throw new InvalidOperationError("Method does not have implementation yet");
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

import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";

// Models
import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";
import { Security } from "../model/Security";

import { PersistentStorage } from "../data/PersistentStorage";
import { Subscriber } from "../model/Subscriber";
import { UnknownApiError, apiHandledException } from "./errors";

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

	public async getAvailableWebhooks(
		cancellationToken: CancellationToken,
		subscriberSecurity: Security
	): Promise<Array<Webhook>> {
		this._log.debug(`Run subscriberWebhook with subscriberSecurity: ${subscriberSecurity}`);

		try {
			const webhooks: Array<Webhook> = await this._storage.getAvailableWebhooks(cancellationToken, subscriberSecurity);

			return webhooks;

		} catch (e) {
			this._log.error(`getAvailableWebhooks Error: ${e.message}`);
			throw apiHandledException(e);
		}
	}

	/**
	 * Subscribe topic as Webhook
	 * @param cancellationToken Allows you to try to cancel execution
	 * @param topic Describes message source topic (includes topic security)
	 * @param opts Webhook specific options
	 */
	public async subscriberWebhook(
		cancellationToken: CancellationToken, topic: Topic.Name & { readonly subscriberSecurity: Security }, webhookData: Webhook.Data
	): Promise<Webhook> {

		this._log.debug(`Run subscriberWebhook with topic: ${topic} and webhookData ${webhookData}`);

		try {
			const topicRecord: Topic = await this._storage.getTopicByName(cancellationToken, topic.topicName);

			const subscriberSecurityKind = topicRecord.subscriberSecurity.kind;
			const subscriberSecurityToken = topicRecord.subscriberSecurity.token;

			if (topic.subscriberSecurity.kind !== subscriberSecurityKind
				|| topic.subscriberSecurity.token !== subscriberSecurityToken) {
				throw new UnknownApiError(`Wrong Subscriber Security Kind or Subscriber Security Token`);
			}

			const webhookId: Webhook = await this._storage.addSubscriberWebhook(cancellationToken, topic.topicName, webhookData);

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
	 */
	public async unsubscribeWebhook(
		cancellationToken: CancellationToken, webhook: Webhook.Id & Subscriber.Security
	): Promise<SubscriberApi.TopicMap> {
		this._log.debug(`Run subscriberWebhook with webhook: ${webhook}`);

		try {
			const topic: Topic = await this._storage.getTopicByWebhookId(cancellationToken, webhook.webhookId);

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

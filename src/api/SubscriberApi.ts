import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";

// Models
import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";

import { PersistentStorage } from "../data/PersistentStorage";

/**
 * Subscriber API allows subscribe/unsibscribe for events via webhooks and other subscriber's type
 */
export class SubscriberApi extends Initable {
	// private readonly _storageProvider!: StorageProvider;
	private readonly _logger: Logger;
	private readonly _storage: PersistentStorage;

	constructor(_storage: PersistentStorage, log: Logger) {
		super();
		this._storage = _storage;
		this._logger = log;
	}

	public async getAvailableTopics(
		cancellationToken: CancellationToken
	): Promise<SubscriberApi.TopicMap> {
		const hardCodedMap = new Map();
		const topics: Topic[] = await this._storage.getAvailableTopics(cancellationToken);

		for (const topic of topics) {
			hardCodedMap.set(topic.topicId, topic);
		}

		return hardCodedMap;
	}

	/**
	 * Subscribe topic as Webhook
	 * @param cancellationToken Allows you to try to cancel execution
	 * @param topic Describes message source topic (includes topic security)
	 * @param opts Webhook specific options
	 */
	public async subscribeWebhook(
		cancellationToken: CancellationToken, topic: Topic.Id & Topic.SubscriberSecurity, webhookData: Webhook.Data
	): Promise<Webhook> {

		// const webhookId: Webhook.Id = await this._storage.addSubscribeWebhook(cancellationToken, recipientUserId, opts);

		// return webhookId;

		throw new InvalidOperationError("Method does not have implementation yet");
	}

	/**
	 * Unsubscribe previously subscribed Webhook
	 * @param cancellationToken Allows you to try to cancel execution
	 * @param webhook Webhook identifier and security
	 */
	public async unsubscribeWebhook(
		cancellationToken: CancellationToken, webhook: Webhook.Id & Webhook.Security
	): Promise<SubscriberApi.TopicMap> {
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
	export type TopicMap = Map<Topic["topicId"], Topic>;
}

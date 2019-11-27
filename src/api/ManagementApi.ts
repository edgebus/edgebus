import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";

// Models
import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";
import { RecipientUser } from "../model/RecipientUser";

import { StorageProvider } from "../provider/StorageProvider";
import { PersistentStorage } from "../data/PersistentStorage";

/**
 * Management API allows to control user's delivery endpoints, like add/remove webhooks
 */
export class ManagementApi extends Initable {
	private readonly _storageProvider!: StorageProvider;
	private readonly _logger: Logger;

	private _persistentStorage: PersistentStorage | null = null;

	constructor(storageProvider: StorageProvider, log: Logger) {
		super();
		this._storageProvider = storageProvider;
		this._logger = log;
	}

	public async getAvailableTopics(
		cancellationToken: CancellationToken, recipientUserId: RecipientUser.Id
	): Promise<ManagementApi.TopicMap> {
		if (this._logger.isTraceEnabled) {
			this._logger.trace(`Enter: getAvailableTopics(recipientUserId="${recipientUserId}")`);
		}

		const hardCodedMap = new Map();
		const storage = this.getPersistentStorage();
		const topics: Topic[] = await storage.getAvailableTopics(cancellationToken, recipientUserId);

		for (const topic of topics) {
			hardCodedMap.set(topic.topicId, topic);
		}

		return hardCodedMap;
	}

	public async subscribeWebhook(
		cancellationToken: CancellationToken, recipientUserId: RecipientUser.Id, opts: Webhook.Data
	): Promise<Webhook.Id> {
		if (this._logger.isTraceEnabled) {
			this._logger.trace(`Enter: subscribeWebhook(recipientUserId="${recipientUserId}", opts="${opts}")`);
		}

		const storage = this.getPersistentStorage();

		const webhookId: Webhook.Id = await storage.addSubscribeWebhook(cancellationToken, recipientUserId, opts);

		return webhookId;
	}

	public async unsubscribeWebhook(
		cancellationToken: CancellationToken, recipientUserId: RecipientUser.Id, webhookId: Webhook.Id
	): Promise<ManagementApi.TopicMap> {
		throw new InvalidOperationError("Method does not have implementation yet");
	}


	protected async onInit() {
		// nop
	}
	protected async onDispose() {
		// nop
	}

	private getPersistentStorage(): PersistentStorage {
		if (this._persistentStorage) {
			return this._persistentStorage;
		} else {
			this._persistentStorage = this._storageProvider.persistentStorage;
			return this._persistentStorage;
		}
	}
}

export namespace ManagementApi {
	export type TopicMap = Map<Topic["topicId"], Topic>;
}

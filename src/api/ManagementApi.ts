import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";

import * as crypto from "crypto";

// Models
import { Topic } from "../model/Topic";
import { Security } from "../model/Security";
import { Publisher } from "../model/Publisher";
import { Subscriber } from "../model/Subscriber";

import { TOKEN_BYTES_LEN } from "../constants";
import { PersistentStorage } from "../data/PersistentStorage";
import { apiHandledException, WrongArgumentApiError } from "./errors";

/**
 * Management API allows to control user's delivery endpoints, like add/remove webhooks
 */
export class ManagementApi extends Initable {
	private readonly _storage: PersistentStorage;
	private readonly _log: Logger;

	constructor(storage: PersistentStorage, log: Logger) {
		super();
		this._storage = storage;
		this._log = log;
	}

	public async createTopic(
		cancellationToken: CancellationToken, topic: Topic.Name & Topic.Data
	): Promise<Topic.Name & Topic.Security & Publisher.Security & Subscriber.Security> {
		this._log.debug(`Run createTopic with topic: ${topic}`);

		try {
			const fullTopicData: Topic.Name & Topic.Data & Topic.Security & Publisher.Security & Subscriber.Security = {
				topicName: topic.topicName, topicDescription: topic.topicDescription, mediaType: topic.mediaType,
				topicSecurity: { kind: "TOKEN", token: crypto.randomBytes(TOKEN_BYTES_LEN).toString("hex") },
				publisherSecurity: { kind: "TOKEN", token: crypto.randomBytes(TOKEN_BYTES_LEN).toString("hex") },
				subscriberSecurity: { kind: "TOKEN", token: crypto.randomBytes(TOKEN_BYTES_LEN).toString("hex") }
			};

			return await this._storage.addTopic(cancellationToken, fullTopicData);
		} catch (e) {
			this._log.error(`createTopic Error: ${e.message}`);
			throw apiHandledException(e);
		}
	}

	public async destroyTopic(
		cancellationToken: CancellationToken, topic: Topic.Name & { readonly topicSecurity: Security }
	): Promise<void> {
		this._log.debug(`Run destroyTopic with topic: ${topic}`);

		try {
			const topicRecord: Topic = await this._storage.getTopicByName(cancellationToken, topic.topicName);

			const topicSecurityyKind = topicRecord.topicSecurity.kind;
			const topicSecurityToken = topicRecord.topicSecurity.token;

			if (topic.topicSecurity.kind !== topicSecurityyKind
				|| topic.topicSecurity.token !== topicSecurityToken) {
				throw new WrongArgumentApiError(`Wrong topic Security Kind or topic Security Token`);
			}

			if (topicRecord.deleteAt) {
				throw new WrongArgumentApiError(`Topic ${topic.topicName} already deleted`);
			}

			return await this._storage.deleteTopic(cancellationToken, topic);
		} catch (e) {
			this._log.error(`destroyTopic Error: ${e.message}`);
			throw apiHandledException(e);
		}
	}

	protected async onInit() {
		// nop
	}
	protected async onDispose() {
		// nop
	}
}

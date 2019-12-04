import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";

import * as crypto from "crypto";

// Models
import { Topic } from "../model/Topic";
import { Security } from "../model/Security";

import { TOKEN_BYTES_LEN } from "../constants";
import { PersistentStorage } from "../data/PersistentStorage";
import { Publisher } from "../model/Publisher";
import { Subscriber } from "../model/Subscriber";

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
		cancellationToken: CancellationToken, topic: Topic.Data): Promise<Topic> {
		const fullTopicData: Topic.Data & Topic.Security & Publisher.Security & Subscriber.Security = {
			topicName: topic.topicName,
			topicDescription: topic.topicDescription,
			mediaType: topic.mediaType,
			topicSecurity: { kind: "TOKEN", token: crypto.randomBytes(TOKEN_BYTES_LEN).toString("hex") },
			publisherSecurity: { kind: "TOKEN", token: crypto.randomBytes(TOKEN_BYTES_LEN).toString("hex") },
			subscriberSecurity: { kind: "TOKEN", token: crypto.randomBytes(TOKEN_BYTES_LEN).toString("hex") }
		};

		return await this._storage.addTopic(cancellationToken, fullTopicData);
	}

	public async destroyTopic(
		cancellationToken: CancellationToken, topic: Topic.Name & { readonly topicSecurity: Security }
	): Promise<void> {
		return await this._storage.deleteTopic(cancellationToken, topic);
	}

	protected async onInit() {
		// nop
	}
	protected async onDispose() {
		// nop
	}
}

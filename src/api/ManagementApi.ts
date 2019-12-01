import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";

import * as crypto from "crypto";

// Models
import { Topic } from "../model/Topic";

import { StorageProvider } from "../provider/StorageProvider";
import { TOKEN_BYTES_LEN } from "../constants";

/**
 * Management API allows to control user's delivery endpoints, like add/remove webhooks
 */
export class ManagementApi extends Initable {
	private readonly _storageProvider: StorageProvider;
	private readonly _log: Logger;

	constructor(storageProvider: StorageProvider, log: Logger) {
		super();
		this._storageProvider = storageProvider;
		this._log = log;
	}

	public async createTopic(
		cancellationToken: CancellationToken, topicData: Topic.Data
	): Promise<Topic> {
		const fullTopicData: Topic.Data & Topic.TopicSecurity & Topic.PublisherSecurity & Topic.SubscriberSecurity = {
			name: topicData.name,
			description: topicData.description,
			topicSecurityKind: "TOKEN",
			topicSecurityToken: crypto.randomBytes(TOKEN_BYTES_LEN).toString("hex"),
			publisherSecurityKind: "TOKEN",
			publisherSecurityToken: crypto.randomBytes(TOKEN_BYTES_LEN).toString("hex"),
			subscriberSecurityKind: "TOKEN",
			subscriberSecurityToken: crypto.randomBytes(TOKEN_BYTES_LEN).toString("hex")
		};

		//await this._storageProvider.persistentStorage.addTopic(....);
		throw new InvalidOperationError("Method does not have implementation yet");
	}

	public async destroyTopic(
		cancellationToken: CancellationToken, topic: Topic.Id & Topic.TopicSecurity
	): Promise<void> {
		//await this._storageProvider.persistentStorage.deleteTopic(....);
		throw new InvalidOperationError("Method does not have implementation yet");
	}


	protected async onInit() {
		// nop
	}
	protected async onDispose() {
		// nop
	}
}

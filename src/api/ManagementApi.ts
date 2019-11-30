import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";

// Models
import { Topic } from "../model/Topic";

import { StorageProvider } from "../provider/StorageProvider";

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
		//await this._storageProvider.persistentStorage.addTopic(....);
		throw new InvalidOperationError("Method does not have implementation yet");
	}

	public async destroyTopic(
		cancellationToken: CancellationToken, topic: Topic.Id & Topic.Security
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

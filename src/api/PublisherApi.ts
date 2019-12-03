import { CancellationToken, Logger, PublisherChannel } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";

// Models
import { Message } from "../model/Message";
import { Publisher } from "../model/Publisher";
import { Security } from "../model/Security";
import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";

import { MessageBusProvider } from "../provider/MessageBusProvider";

import { PersistentStorage } from "../data/PersistentStorage";

/**
 * Publisher API allows to send messages to the topics
 */
export class PublisherApi extends Initable {
	private readonly _storage: PersistentStorage;
	private readonly _messageBusProvider: MessageBusProvider;
	private readonly _log: Logger;

	public constructor(storage: PersistentStorage, messageBusProvider: MessageBusProvider, log: Logger) {
		super();
		this._storage = storage;
		this._messageBusProvider = messageBusProvider;
		this._log = log;
	}

	public async createHttpPublisher(
		cancellationToken: CancellationToken, topic: Topic.Name & { readonly subscriberSecurity: Security }, webhookData: Webhook.Data
	): Promise<void> {

		// >>>>
		// {
		// 	"topic": "MyGitLabPushTopic.yourdomain.ltd",
		// 	"publisherSecurity": {
		// 		"kind": "TOKEN",
		// 		"token": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
		// 	},
		// 	"ssl": {
		// 		... optional
		// 	}
		// }

		// <<<<
		// {
		// 	"publisherId": "publisher.http.18af3285-749a-4fe8-abc0-52a42cd82cb6",
		// 	"url": "https://notifier.pub.zxteam.org/publisher/http/18af3285-749a-4fe8-abc0-52a42cd82cb6"
		// }

		throw new InvalidOperationError("Not implemented yet");
	}

	public async destroyPublisher(
		cancellationToken: CancellationToken, publisher: Publisher.Id & { readonly publisherSecurity: Security }
	): Promise<void> {

		// >>>>
		// {
		// 	"publisherSecurity": {
		// 		"kind": "TOKEN",
		// 		"token": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
		// 	},
		// 	"publisherId": "publisher.http.641f97ec-31d0-418b-a594-0e9aa3a356a5"
		// }

		// <<<<
		// {
		// 	"deleteDate": "2019-10-10T12:00:01.223Z"
		// }

		throw new InvalidOperationError("Not implemented yet");
	}


	protected async onInit() {
		// nop
	}
	protected async onDispose() {
		// nop
	}
}

export namespace PublisherApi {

}

import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";

// Models
import { Publisher } from "../model/Publisher";
import { Security } from "../model/Security";
import { Topic } from "../model/Topic";

import { MessageBusProvider } from "../provider/MessageBusProvider";

import { PersistentStorage } from "../data/PersistentStorage";
import { UnknownApiError, apiHandledException } from "../index";

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
		cancellationToken: CancellationToken, topic: Topic.Name & { readonly publisherSecurity: Security }
	): Promise<Publisher.Id> {

		// try {
		// 	const topicRecord: Topic = await this._storage.getTopicByName(cancellationToken, publisher.topicName);

		// 	const publisherSecurityKind = topicRecord.publisherSecurity.kind;
		// 	const publisherSecurityToken = topicRecord.publisherSecurity.token;

		// 	if (publisher.publisherSecurity.kind !== publisherSecurityKind
		// 		|| publisher.publisherSecurity.token !== publisherSecurityToken) {
		// 		throw new UnknownApiError(`Wrong Publisher Security Kind or Publisher Security Token`);
		// 	}

		// 	const publisherModel: Publisher = await this._storage.addPublisherHttp(cancellationToken, publisher);

		// 	return publisherModel;
		// } catch (e) {
		// 	this._log.error(`createHttpPublisher Error: ${e.message}`);
		// 	throw apiHandledException(e);
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

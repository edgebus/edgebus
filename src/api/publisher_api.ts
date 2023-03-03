import {  FExceptionInvalidOperation, FExecutionContext, FInitableBase, FLogger } from "@freemework/common";

// Models
import { Publisher } from "../model/publisher";
import { Security } from "../model/security";
import { Topic } from "../model/topic";

import { MessageBusProvider } from "../provider/message_bus_provider";

import { PersistentStorage } from "../data/persistent_storage";

/**
 * Publisher API allows to send messages to the topics
 */
export class PublisherApi extends FInitableBase {
	private readonly _storage: PersistentStorage;
	private readonly _messageBusProvider: MessageBusProvider;
	private readonly _log: FLogger;

	public constructor(storage: PersistentStorage, messageBusProvider: MessageBusProvider, log: FLogger) {
		super();
		this._storage = storage;
		this._messageBusProvider = messageBusProvider;
		this._log = log;
	}

	public async createHttpPublisher(
		executionContext: FExecutionContext, topic: Topic.Id & { readonly publisherSecurity: Security }
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

		throw new FExceptionInvalidOperation("Not implemented yet");
	}

	public async destroyPublisher(
		executionContext: FExecutionContext, publisher: Publisher.Id & { readonly publisherSecurity: Security }
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

		throw new FExceptionInvalidOperation("Not implemented yet");
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

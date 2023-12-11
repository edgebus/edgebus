import {  FExceptionInvalidOperation, FExecutionContext, FInitableBase, FLogger } from "@freemework/common";

// Models
import { Ingress } from "../model/ingress";
import { Security } from "../model/security";
import { Topic } from "../model/topic";

import { MessageBusProvider } from "../provider/message_bus_provider";

import { DatabaseFactory } from "../data/database_factory";

/**
 * Ingress API allows to send messages to the topics
 */
export class PublisherApi extends FInitableBase {
	private readonly _storage: DatabaseFactory;
	private readonly _messageBusProvider: MessageBusProvider;
	private readonly _log: FLogger;

	public constructor(storage: DatabaseFactory, messageBusProvider: MessageBusProvider, log: FLogger) {
		super();
		this._storage = storage;
		this._messageBusProvider = messageBusProvider;
		this._log = log;
	}

	public async createHttpPublisher(
		executionContext: FExecutionContext, topic: Topic.Id & { readonly publisherSecurity: Security }
	): Promise<Ingress.Id> {

		// try {
		// 	const topicRecord: Topic = await this._storage.getTopicByName(cancellationToken, ingress.topicName);

		// 	const publisherSecurityKind = topicRecord.publisherSecurity.kind;
		// 	const publisherSecurityToken = topicRecord.publisherSecurity.token;

		// 	if (ingress.publisherSecurity.kind !== publisherSecurityKind
		// 		|| ingress.publisherSecurity.token !== publisherSecurityToken) {
		// 		throw new UnknownApiError(`Wrong Ingress Security Kind or Ingress Security Token`);
		// 	}

		// 	const publisherModel: Ingress = await this._storage.addPublisherHttp(cancellationToken, ingress);

		// 	return publisherModel;
		// } catch (e) {
		// 	this._log.error(`createHttpPublisher Error: ${e.message}`);
		// 	throw apiHandledException(e);
		// }

		throw new FExceptionInvalidOperation("Not implemented yet");
	}

	public async destroyPublisher(
		executionContext: FExecutionContext, ingress: Ingress.Id & { readonly publisherSecurity: Security }
	): Promise<void> {

		// >>>>
		// {
		// 	"publisherSecurity": {
		// 		"kind": "TOKEN",
		// 		"token": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
		// 	},
		// 	"ingressId": "ingress.http.641f97ec-31d0-418b-a594-0e9aa3a356a5"
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

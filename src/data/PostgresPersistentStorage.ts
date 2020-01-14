import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable, Disposable } from "@zxteam/disposable";
import { SqlProvider, SqlResultRecord, SqlConstraintError } from "@zxteam/sql";
import { PostgresProviderFactory } from "@zxteam/sql-postgres";
import { PersistentStorage } from "./PersistentStorage";

import {
	ConnectionPersistentStorageError,
	NoRecordPersistentStorageError,
	UnknownPersistentStorageError,
	storageHandledException
} from "./errors";
import * as _ from "lodash";

// Sql Tools
import * as sqlToolsPublisher from "./postgres/tb_publisher";
import * as sqlToolsSubscriber from "./postgres/tb_subscriber";
import * as sqlToolsTopic from "./postgres/tb_topic";


// Model
import { Publisher } from "../model/Publisher";
import { Subscriber } from "../model/Subscriber";
import { Security } from "../model/Security";
import { Topic } from "../model/Topic";

//import * as webhookFunctions from "./postgres/webhook";

export class PostgresPersistentStorage extends Initable implements PersistentStorage {
	private readonly _sqlProviderFactory: PostgresProviderFactory;
	private readonly _log: Logger;
	private readonly _url: URL;

	public constructor(url: URL, log: Logger) {
		super();
		this._url = url;
		this._log = log;

		this._sqlProviderFactory = new PostgresProviderFactory({
			url: this._url,
			log: this._log,
			applicationName: "notifier.service"
		});
	}

	public async createPublisher<TDataVariant extends Publisher.DataVariant>(
		cancellationToken: CancellationToken,
		publisherSecurity: Security,
		variant: TDataVariant
	): Promise<Publisher<TDataVariant>> {
		this.verifyInitializedAndNotDisposed();

		try {
			const publisher: Publisher<TDataVariant> = await this._sqlProviderFactory
				.usingProvider(cancellationToken,
					async (sqlProvider: SqlProvider) => sqlToolsPublisher
						.create(cancellationToken, sqlProvider, publisherSecurity, variant)
				);

			return publisher;
		} catch (e) {
			throw storageHandledException(e);
		}
	}

	public async createSubscriber<TDataVariant extends Subscriber.DataVariant>(
		cancellationToken: CancellationToken,
		subscriberSecurity: Security,
		variant: TDataVariant
	): Promise<Subscriber<TDataVariant>> {
		this.verifyInitializedAndNotDisposed();

		try {
			const subscriber: Subscriber<TDataVariant> = await this._sqlProviderFactory
				.usingProvider(cancellationToken,
					async (sqlProvider: SqlProvider) => sqlToolsSubscriber
						.create(cancellationToken, sqlProvider, subscriberSecurity, variant)
				);

			return subscriber;
		} catch (e) {
			throw storageHandledException(e);
		}
	}

	public async createTopic(
		cancellationToken: CancellationToken,
		topicSecurity: Security,
		topicData: Topic.Id & Topic.Data
	): Promise<Topic> {
		this.verifyInitializedAndNotDisposed();

		try {
			const topic: Topic = await this._sqlProviderFactory
				.usingProvider(cancellationToken,
					async (sqlProvider: SqlProvider) =>
						sqlToolsTopic.create(cancellationToken, sqlProvider, topicSecurity, topicData)
				);

			return topic;
		} catch (e) {
			this._log.error(`addTopic Error: ${e.message}`);
			throw storageHandledException(e);
		}
	}

	public async listTopics(
		cancellationToken: CancellationToken,
		domain: string | null
	): Promise<Array<Topic>> {

		try {
			const topics: Array<Topic> = await this._sqlProviderFactory
				.usingProvider(cancellationToken,
					async (sqlProvider: SqlProvider) =>
						sqlToolsTopic.list(cancellationToken, sqlProvider, domain)
				);

			return topics;
		} catch (e) {
			throw storageHandledException(e);
		}
	}

	// public async removeSubscriber(
	// 	cancellationToken: CancellationToken,
	// 	subscriberId: Subscriber["subscriberId"]
	// ): Promise<void> {
	// 	this.verifyInitializedAndNotDisposed();

	// 	try {
	// 		await this._sqlProviderFactory.usingProvider(cancellationToken,
	// 			async (sqlProvider: SqlProvider) => sqlToolsSubscriber
	// 				.setDeleteDate(cancellationToken, sqlProvider, subscriberId)
	// 		);
	// 	} catch (e) {
	// 		throw storageHandledException(e);
	// 	}
	// }


	// public async deleteTopic(
	// 	cancellationToken: CancellationToken,
	// 	topicData: Topic.Name & TopicSecurity
	// ): Promise<void> {
	// 	this._log.debug(`Run deleteTopic with topicData: ${topicData}`);
	// 	this.verifyInitializedAndNotDisposed();
	// 	try {

	// 		await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
	// 			return await topicFunctions.updateDeleteDate(cancellationToken, sqlProvider, topicData.topicName);
	// 		});
	// 		return;

	// 	} catch (e) {
	// 		this._log.error(`deleteTopic Error: ${e.message}`);
	// 		throw storageHandledException(e);
	// 	}
	// }

	// public async addSubscriberWebhook(
	// 	cancellationToken: CancellationToken,
	// 	topicName: Topic.Name["topicName"],
	// 	webhookData: Webhook.Data
	// ): Promise<Webhook> {

	// 	this._log.debug(`Run addSubscriberWebhook with topicName: ${topicName} and webhookData ${webhookData}`);
	// 	this.verifyInitializedAndNotDisposed();

	// 	try {

	// 		const webhook: Webhook
	// 			= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
	// 				return await webhookFunctions.save(cancellationToken, sqlProvider, topicName, webhookData);
	// 			});

	// 		return webhook;

	// 	} catch (e) {
	// 		this._log.error(`addSubscriberWebhook Error: ${e.message}`);
	// 		throw storageHandledException(e);
	// 	}
	// }

	// public getSubscriberWebhook(
	// 	cancellationToken: CancellationToken,
	// 	webhook: Webhook.Id["webhookId"]
	// ): Promise<Webhook> {
	// 	this._log.debug(`Run getSubscriberWebhook with webhook: ${webhook}`);
	// 	this.verifyInitializedAndNotDisposed();
	// 	throw new Error("Method not implemented.");
	// }

	// public async getTopicByWebhookId(cancellationToken: CancellationToken, webhookId: Webhook.Id["webhookId"]): Promise<Topic> {
	// 	this._log.debug(`Run getTopicByWebhookId with webhookId: ${webhookId}`);
	// 	this.verifyInitializedAndNotDisposed();

	// 	try {
	// 		const topic: Topic
	// 			= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
	// 				return await topicFunctions.getTopicByWebhookId(cancellationToken, sqlProvider, webhookId);
	// 			});

	// 		return topic;
	// 	} catch (e) {
	// 		this._log.error(`getTopicByWebhookId Error: ${e.message}`);
	// 		throw storageHandledException(e);
	// 	}
	// }

	// public async getTopicByName(cancellationToken: CancellationToken, topicName: Topic.Name["topicName"]): Promise<Topic> {
	// 	this._log.debug(`Run getTopicByName with topicName: ${topicName}`);
	// 	this.verifyInitializedAndNotDisposed();

	// 	try {
	// 		const topic: Topic
	// 			= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
	// 				return await topicFunctions.getByName(cancellationToken, sqlProvider, topicName);
	// 			});

	// 		return topic;
	// 	} catch (e) {
	// 		this._log.error(`getTopicByName Error: ${e.message}`);
	// 		throw storageHandledException(e);
	// 	}
	// }

	// public async getAvailableWebhooks(cancellationToken: CancellationToken, security: Security): Promise<Array<Webhook>> {
	// 	this._log.debug(`Run getAvailableWebhooks with security: ${security}`);
	// 	this.verifyInitializedAndNotDisposed();

	// 	try {
	// 		const webhooks: Array<Webhook>
	// 			= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
	// 				return await webhookFunctions.getBySecurity(cancellationToken, sqlProvider, security);
	// 			});

	// 		return webhooks;
	// 	} catch (e) {
	// 		this._log.error(`getTopicByName Error: ${e.message}`);
	// 		throw storageHandledException(e);
	// 	}
	// }

	// public removeSubscriberWebhook(
	// 	cancellationToken: CancellationToken, webhook: Webhook.Id["webhookId"]
	// ): Promise<void> {
	// 	throw new Error("");
	// }

	protected async onInit(cancellationToken: CancellationToken): Promise<void> {
		await this._sqlProviderFactory.init(cancellationToken);
	}

	protected async onDispose(): Promise<void> {
		await this._sqlProviderFactory.dispose();
	}
}

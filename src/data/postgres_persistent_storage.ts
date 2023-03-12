import { FException, FExecutionContext, FInitableBase, FLogger, FSqlConnection } from "@freemework/common";
import { FSqlConnectionFactoryPostgres } from "@freemework/sql.postgres";

import { PersistentStorage } from "./persistent_storage";

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
import { Publisher } from "../model/publisher";
import { Subscriber } from "../model/subscriber";
import { Security } from "../model/security";
import { Topic } from "../model/topic";

//import * as webhookFunctions from "./postgres/webhook";

export class PostgresPersistentStorage extends FInitableBase implements PersistentStorage {
	private readonly _sqlProviderFactory: FSqlConnectionFactoryPostgres;
	private readonly _log: FLogger;
	private readonly _url: URL;

	public constructor(url: URL, log: FLogger) {
		super();
		this._url = url;
		this._log = log;

		this._log.debug(FExecutionContext.Empty, `Construct ${PostgresPersistentStorage.name} for URL ${url}`);

		this._sqlProviderFactory = new FSqlConnectionFactoryPostgres({
			url: this._url,
			// log: this._log,
			applicationName: "notifier.service"
		});
	}

	public async createPublisher<TDataVariant extends Publisher.DataVariant>(
		executionContext: FExecutionContext,
		publisherSecurity: Security,
		variant: TDataVariant
	): Promise<Publisher<TDataVariant>> {
		this.verifyInitializedAndNotDisposed();

		try {
			const publisher: Publisher<TDataVariant> = await this._sqlProviderFactory
				.usingProvider(executionContext,
					async (sqlProvider: FSqlConnection) => sqlToolsPublisher
						.create(executionContext, sqlProvider, publisherSecurity, variant)
				);

			return publisher;
		} catch (e) {
			throw storageHandledException(e);
		}
	}

	public async createSubscriber<TDataVariant extends Subscriber.DataVariant>(
		executionContext: FExecutionContext,
		subscriberSecurity: Security,
		variant: TDataVariant
	): Promise<Subscriber<TDataVariant>> {
		this.verifyInitializedAndNotDisposed();

		try {
			const subscriber: Subscriber<TDataVariant> = await this._sqlProviderFactory
				.usingProvider(executionContext,
					async (sqlProvider: FSqlConnection) => sqlToolsSubscriber
						.create(executionContext, sqlProvider, subscriberSecurity, variant)
				);

			return subscriber;
		} catch (e) {
			throw storageHandledException(e);
		}
	}

	public async createTopic(
		executionContext: FExecutionContext,
		topicSecurity: Security,
		topicData: Topic.Id & Topic.Data
	): Promise<Topic> {
		this.verifyInitializedAndNotDisposed();

		try {
			const topic: Topic = await this._sqlProviderFactory
				.usingProvider(executionContext,
					async (sqlProvider: FSqlConnection) =>
						sqlToolsTopic.create(executionContext, sqlProvider, topicSecurity, topicData)
				);

			return topic;
		} catch (e) {
			const ex: FException = FException.wrapIfNeeded(e);
			this._log.error(executionContext, `addTopic Error: ${ex.message}`);
			throw storageHandledException(e);
		}
	}

	public async listTopics(
		executionContext: FExecutionContext,
		domain: string | null
	): Promise<Array<Topic>> {

		try {
			const topics: Array<Topic> = await this._sqlProviderFactory
				.usingProvider(executionContext,
					async (sqlProvider: FSqlConnection) =>
						sqlToolsTopic.list(executionContext, sqlProvider, domain)
				);

			return topics;
		} catch (e) {
			throw storageHandledException(e);
		}
	}

	public async savePublisherMessage(
		executionContext: FExecutionContext,
	): Promise<void> {
		this._sqlProviderFactory.usingProvider(executionContext, async (sqlProvider: FSqlConnection) => {
			sqlProvider.statement(`INSERT INTO "edgebus_audit"."incoming_request_http"(
				"http_method", "http_url", "request_headers")
				VALUES ($1, $2, $3)`).execute(executionContext, "test", "GET", "{}");
		});
	}

	// public async removeSubscriber(
	// 	executionContext: FExecutionContext,
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
	// 	executionContext: FExecutionContext,
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
	// 	executionContext: FExecutionContext,
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
	// 	executionContext: FExecutionContext,
	// 	webhook: Webhook.Id["webhookId"]
	// ): Promise<Webhook> {
	// 	this._log.debug(`Run getSubscriberWebhook with webhook: ${webhook}`);
	// 	this.verifyInitializedAndNotDisposed();
	// 	throw new Error("Method not implemented.");
	// }

	// public async getTopicByWebhookId(executionContext: FExecutionContext, webhookId: Webhook.Id["webhookId"]): Promise<Topic> {
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

	// public async getTopicByName(executionContext: FExecutionContext, topicName: Topic.Name["topicName"]): Promise<Topic> {
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

	// public async getAvailableWebhooks(executionContext: FExecutionContext, security: Security): Promise<Array<Webhook>> {
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
	// 	executionContext: FExecutionContext, webhook: Webhook.Id["webhookId"]
	// ): Promise<void> {
	// 	throw new Error("");
	// }

	protected async onInit(): Promise<void> {
		await this._sqlProviderFactory.init(this.initExecutionContext);
	}

	protected async onDispose(): Promise<void> {
		await this._sqlProviderFactory.dispose();
	}
}

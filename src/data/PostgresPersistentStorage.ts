// import { CancellationToken, Logger } from "@zxteam/contract";
// import { Initable, Disposable } from "@zxteam/disposable";
// import { SqlProvider, SqlResultRecord, SqlConstraintError } from "@zxteam/sql";
// import { PostgresProviderFactory } from "@zxteam/sql-postgres";
// import { PersistentStorage } from "./PersistentStorage";

// import {
// 	ConnectionPersistentStorageError,
// 	NoRecordPersistentStorageError,
// 	UnknownPersistentStorageError,
// 	storageHandledException
// } from "./errors";
// import * as _ from "lodash";

// // Model
// import { Topic } from "../model/Topic";
// import { Subscriber } from "../model/Subscriber";
// import { Publisher } from "../model/Publisher";

// // Simple function for postgres database
// import * as topicFunctions from "./postgres/topic";
// //import * as webhookFunctions from "./postgres/webhook";
// import { Security } from "../model/Security";
// import { TopicSecurity } from "../model/TopicSecurity";
// import { PublisherSecurity } from "../model/PublisherSecurity";
// import { SubscriberSecurity } from "../model/SubscriberSecurity";

// export class PostgresPersistentStorage extends Initable implements PersistentStorage {
// 	private readonly _sqlProviderFactory: PostgresProviderFactory;
// 	private readonly _log: Logger;
// 	private readonly _url: URL;

// 	public constructor(url: URL, log: Logger) {
// 		super();
// 		this._url = url;
// 		this._log = log;

// 		this._sqlProviderFactory = new PostgresProviderFactory({
// 			url: this._url,
// 			log: this._log,
// 			applicationName: "notifier.service"
// 		});
// 	}

// 	public async addTopic(
// 		cancellationToken: CancellationToken,
// 		topicData: Topic.Data & TopicSecurity & PublisherSecurity & SubscriberSecurity
// 	): Promise<Topic> {
// 		this._log.debug(`Run addTopic with topicData: ${topicData}`);
// 		this.verifyInitializedAndNotDisposed();

// 		try {

// 			const topic: Topic = await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
// 				return await topicFunctions.save(cancellationToken, sqlProvider, topicData);
// 			});

// 			return topic;
// 		} catch (e) {
// 			this._log.error(`addTopic Error: ${e.message}`);
// 			throw storageHandledException(e);
// 		}

// 	}

// 	public async deleteTopic(
// 		cancellationToken: CancellationToken,
// 		topicData: Topic.Name & TopicSecurity
// 	): Promise<void> {
// 		this._log.debug(`Run deleteTopic with topicData: ${topicData}`);
// 		this.verifyInitializedAndNotDisposed();
// 		try {

// 			await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
// 				return await topicFunctions.updateDeleteDate(cancellationToken, sqlProvider, topicData.topicName);
// 			});
// 			return;

// 		} catch (e) {
// 			this._log.error(`deleteTopic Error: ${e.message}`);
// 			throw storageHandledException(e);
// 		}
// 	}

// 	public async addSubscriberWebhook(
// 		cancellationToken: CancellationToken,
// 		topicName: Topic.Name["topicName"],
// 		webhookData: Webhook.Data
// 	): Promise<Webhook> {

// 		this._log.debug(`Run addSubscriberWebhook with topicName: ${topicName} and webhookData ${webhookData}`);
// 		this.verifyInitializedAndNotDisposed();

// 		try {

// 			const webhook: Webhook
// 				= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
// 					return await webhookFunctions.save(cancellationToken, sqlProvider, topicName, webhookData);
// 				});

// 			return webhook;

// 		} catch (e) {
// 			this._log.error(`addSubscriberWebhook Error: ${e.message}`);
// 			throw storageHandledException(e);
// 		}
// 	}

// 	public getSubscriberWebhook(
// 		cancellationToken: CancellationToken,
// 		webhook: Webhook.Id["webhookId"]
// 	): Promise<Webhook> {
// 		this._log.debug(`Run getSubscriberWebhook with webhook: ${webhook}`);
// 		this.verifyInitializedAndNotDisposed();
// 		throw new Error("Method not implemented.");
// 	}

// 	public async getTopicByWebhookId(cancellationToken: CancellationToken, webhookId: Webhook.Id["webhookId"]): Promise<Topic> {
// 		this._log.debug(`Run getTopicByWebhookId with webhookId: ${webhookId}`);
// 		this.verifyInitializedAndNotDisposed();

// 		try {
// 			const topic: Topic
// 				= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
// 					return await topicFunctions.getTopicByWebhookId(cancellationToken, sqlProvider, webhookId);
// 				});

// 			return topic;
// 		} catch (e) {
// 			this._log.error(`getTopicByWebhookId Error: ${e.message}`);
// 			throw storageHandledException(e);
// 		}
// 	}

// 	public async getTopicByName(cancellationToken: CancellationToken, topicName: Topic.Name["topicName"]): Promise<Topic> {
// 		this._log.debug(`Run getTopicByName with topicName: ${topicName}`);
// 		this.verifyInitializedAndNotDisposed();

// 		try {
// 			const topic: Topic
// 				= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
// 					return await topicFunctions.getByName(cancellationToken, sqlProvider, topicName);
// 				});

// 			return topic;
// 		} catch (e) {
// 			this._log.error(`getTopicByName Error: ${e.message}`);
// 			throw storageHandledException(e);
// 		}
// 	}

// 	public async getAvailableWebhooks(cancellationToken: CancellationToken, security: Security): Promise<Array<Webhook>> {
// 		this._log.debug(`Run getAvailableWebhooks with security: ${security}`);
// 		this.verifyInitializedAndNotDisposed();

// 		try {
// 			const webhooks: Array<Webhook>
// 				= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
// 					return await webhookFunctions.getBySecurity(cancellationToken, sqlProvider, security);
// 				});

// 			return webhooks;
// 		} catch (e) {
// 			this._log.error(`getTopicByName Error: ${e.message}`);
// 			throw storageHandledException(e);
// 		}
// 	}

// 	public removeSubscriberWebhook(
// 		cancellationToken: CancellationToken, webhook: Webhook.Id["webhookId"]
// 	): Promise<void> {
// 		throw new Error("");
// 	}

// 	protected async onInit(cancellationToken: CancellationToken): Promise<void> {
// 		await this._sqlProviderFactory.init(cancellationToken);
// 	}

// 	protected async onDispose(): Promise<void> {
// 		await this._sqlProviderFactory.dispose();
// 	}

// }

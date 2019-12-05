import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable, Disposable } from "@zxteam/disposable";
import { SqlProvider, SqlResultRecord, SqlConstraintError } from "@zxteam/sql";
import { PostgresProviderFactory } from "@zxteam/sql-postgres";

import {
	PersistentStorage,
	ForbiddenPersistentStorageError,
	NoRecordPersistentStorageError,
	BadRequestPersistentStorageError
} from "./PersistentStorage";
import * as _ from "lodash";

import { TopicStorage, ITopicStorage } from "./model/TopicStorage";
import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";
import { Subscriber } from "../model/Subscriber";
import { Publisher } from "../model/Publisher";
import { WebHookStorage, IWebHookStorage } from "./model/WebhookStorage";

export class SQLPersistentStorage extends Initable implements PersistentStorage {
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

	public async addTopic(
		cancellationToken: CancellationToken,
		topicData: Topic.Data & Topic.Security & Publisher.Security & Subscriber.Security
	): Promise<Topic> {
		this.verifyInitializedAndNotDisposed();
		try {
			const topic: ITopicStorage = await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
				return await TopicStorage.save(cancellationToken, sqlProvider, topicData);
			});

			const friendlyTopic: Topic = {
				topicName: topic.name,
				topicDescription: topic.description,
				mediaType: topic.mediaType,
				topicSecurity: topic.topicSecurity,
				publisherSecurity: topic.publisherSecurity,
				subscriberSecurity: topic.subscriberSecurity
			};

			return friendlyTopic;
		} catch (error) {
			if (error instanceof SqlConstraintError && error.innerError) {
				// if (error.innerError.code === 23505) {
				throw new BadRequestPersistentStorageError(error.innerError.message);
				// }
			}
			this._log.error(error.message);
			throw error;
		}
	}

	public async deleteTopic(
		cancellationToken: CancellationToken,
		topicData: Topic.Name & Topic.Security
	): Promise<void> {
		this.verifyInitializedAndNotDisposed();
		try {
			const sqlCheck = "SELECT utc_delete_date, topic_security FROM topic WHERE name=$1;";

			const topic = await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
				return await sqlProvider.statement(sqlCheck).executeQuery(cancellationToken, topicData.topicName);
			});

			if (topic.length === 1) {
				const topicSecurity = topic[0].get("topic_security").asString;

				const topicSecurityKind = JSON.parse(topicSecurity).topicSecurityKind;
				const topicSecurityToken = JSON.parse(topicSecurity).topicSecurityToken;

				if (topicData.topicSecurity.kind !== topicSecurityKind
					|| topicData.topicSecurity.token !== topicSecurityToken) {
					throw new ForbiddenPersistentStorageError("Wrong Security Kind or Security Token");
				}

				const deleteDate = topic[0].get("utc_delete_date").asNullableDate;
				if (deleteDate) {
					// Topic already deleted
					throw new BadRequestPersistentStorageError(`Topic ${topicData.topicName} already deleted`);
				}
			} else {
				// Topic does not exist
				throw new NoRecordPersistentStorageError(`Topic with this name '${topicData.topicName}' does not exist`);
			}

			const sqlDelete = "UPDATE topic SET utc_delete_date=(NOW() AT TIME ZONE 'utc') WHERE name=$1;";

			await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
				await sqlProvider.statement(sqlDelete).execute(cancellationToken, topicData.topicName);
			});

			return;
		} catch (error) {
			this._log.error(error.message);
			throw error;
		}
	}

	public async addSubscriberWebhook(
		cancellationToken: CancellationToken,
		topicData: Topic.Name & Subscriber.Security,
		webhookData: Webhook.Data
	): Promise<Webhook> {
		this.verifyInitializedAndNotDisposed();
		try {

			const isExistTopic: boolean = await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
				return TopicStorage.isExsistByName(cancellationToken, topicData.topicName, sqlProvider);
			});

			if (!isExistTopic) {
				const message = `Don't find topic is name ${topicData.topicName}`;
				throw new BadRequestPersistentStorageError(message);
			}

			const topicSelect: ITopicStorage = await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
				return await TopicStorage.getByName(cancellationToken, topicData.topicName, sqlProvider);
			});

			const subscriberSecurityKind = topicSelect.subscriberSecurity.kind;
			const subscriberSecurityToken = topicSelect.subscriberSecurity.token;

			if (topicData.subscriberSecurity.kind !== subscriberSecurityKind
				|| topicData.subscriberSecurity.token !== subscriberSecurityToken) {
				throw new ForbiddenPersistentStorageError(`Wrong Subscriber Security Kind or Subscriber Security Token`);
			}

			const deleteDate = topicSelect.deleteAt;
			if (deleteDate) {
				// Topic already deleted
				throw new BadRequestPersistentStorageError(`Topic ${topicData.topicName} already deleted, can't subscribe`);
			}

			const webhookStorage: IWebHookStorage
				= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
					return await WebHookStorage.save(cancellationToken, sqlProvider, topicSelect, webhookData);
				});

			const webhook: Webhook = {
				webhookId: webhookStorage.webHookId.toString(),
				topicName: topicData.topicName,
				url: webhookStorage.url,
				trustedCaCertificate: webhookStorage.trustedCaCertificate,
				headerToken: webhookStorage.headerToken
			};

			return webhook;
		} catch (e) {
			this._log.error(e);
			throw e;
		}
	}

	public getSubscriberWebhook(
		webhook: Webhook.Id["webhookId"]
	): Promise<Webhook> {
		throw new Error("Method not implemented.");
	}

	public removeSubscriberWebhook(
		cancellationToken: CancellationToken, webhook: Webhook.Id["webhookId"]
	): Promise<void> {
		throw new Error("");
	}

	protected async onInit(cancellationToken: CancellationToken): Promise<void> {
		await this._sqlProviderFactory.init(cancellationToken);
	}

	protected async onDispose(): Promise<void> {
		await this._sqlProviderFactory.dispose();
	}

}

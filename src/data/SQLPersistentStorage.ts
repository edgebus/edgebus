import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable, Disposable } from "@zxteam/disposable";
import { SqlProvider, SqlResultRecord } from "@zxteam/sql";
import { PostgresProviderFactory } from "@zxteam/sql-postgres";

import {
	PersistentStorage,
	ForbiddenPersistentStorageError,
	NoRecordPersistentStorageError,
	BadRequestPersistentStorageError
} from "./PersistentStorage";
import * as _ from "lodash";

import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";
import { Subscriber } from "../model/Subscriber";
import { Publisher } from "../model/Publisher";

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
			const topicSecurity = JSON.stringify({
				kind: topicData.topicSecurity.kind,
				token: topicData.topicSecurity.token
			});
			const publisherSecurity = JSON.stringify({
				kind: topicData.publisherSecurity.kind,
				token: topicData.publisherSecurity.token
			});
			const subscriberSecurity = JSON.stringify({
				kind: topicData.subscriberSecurity.kind,
				token: topicData.subscriberSecurity.token
			});

			const sqlInsert
				= "INSERT INTO topic (name, description, media_type, topic_security, publisher_security, subscriber_security) VALUES ($1, $2, $3, $4, $5, $6);";
			const sqlInsertValue = [
				topicData.topicName,
				topicData.topicDescription,
				topicData.mediaType,
				topicSecurity,
				publisherSecurity,
				subscriberSecurity
			];

			const sqlSelect
				= "SELECT id, name, description, media_type, topic_security, publisher_security, subscriber_security FROM topic WHERE name=$1";
			const sqlSelectValue = [topicData.topicName];

			const topicResult: ReadonlyArray<SqlResultRecord>
				= await this._sqlProviderFactory.usingProviderWithTransaction(cancellationToken, async (sqlProvider: SqlProvider) => {
					await sqlProvider.statement(sqlInsert).execute(cancellationToken, ...sqlInsertValue);
					return await sqlProvider.statement(sqlSelect).executeQuery(cancellationToken, ...sqlSelectValue);
				});

			const topic = topicResult[0];
			const friendlyTopic: Topic = {
				topicName: topic.get("name").asString,
				topicDescription: topic.get("description").asString,
				mediaType: topic.get("media_type").asString,
				topicSecurity: {
					kind: JSON.parse(topic.get("topic_security").asString).kind,
					token: JSON.parse(topic.get("topic_security").asString).token
				},
				publisherSecurity: {
					kind: JSON.parse(topic.get("publisher_security").asString).kind,
					token: JSON.parse(topic.get("publisher_security").asString).token
				},
				subscriberSecurity: {
					kind: JSON.parse(topic.get("subscriber_security").asString).kind,
					token: JSON.parse(topic.get("subscriber_security").asString).token
				}
			};

			return friendlyTopic;
		} catch (error) {
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

	public async getAvailableTopics(cancellationToken: CancellationToken): Promise<Topic[]> {
		this.verifyInitializedAndNotDisposed();

		const sqlProvider = await this._sqlProviderFactory.create(cancellationToken);

		try {
			const friendlyTopics: any[] = [];

			const topics = await sqlProvider
				.statement(`SELECT "id", "name", "description" FROM topic;`)
				.executeQuery(cancellationToken);

			return friendlyTopics;
		} finally {
			await sqlProvider.dispose();
		}

		// const friendlyTopics = [];
		// for (const topic of topics) {
		// 	helper.ensureString(topic, "id");
		// 	helper.ensureString(topic, "name");
		// 	helper.ensureString(topic, "description");

		// 	const friendlyTopic: Topic = {
		// 		topicId: topic.id.toString(),
		// 		name: topic.name,
		// 		description: topic.description,
		// 		topicSecurityKind: "TOKEN",
		// 		topicSecurityToken: "Ololo123:" + topic.id.toString(),
		// 		subscriberSecurityKind: "TOKEN",
		// 		subscriberSecurityToken: "Ololo123:" + topic.id.toString(),
		// 		publisherSecurityKind: "TOKEN",
		// 		publisherSecurityToken: "Ololo123:" + topic.id.toString()
		// 	};
		// 	friendlyTopics.push(friendlyTopic);


	}

	public async addSubscriberWebhook(
		cancellationToken: CancellationToken,
		topicData: Topic.Name & Subscriber.Security,
		webhookData: Webhook.Data
	): Promise<Webhook> {
		this.verifyInitializedAndNotDisposed();
		try {

			const sqlCheck = "SELECT id, utc_delete_date, subscriber_security FROM "
				+ `topic WHERE name='${topicData.topicName}';`;

			const topicSelect = await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
				return await sqlProvider.statement(sqlCheck).executeQuery(cancellationToken);
			});
			if (topicSelect.length === 1) {

				const topicSecurity = topicSelect[0].get("subscriber_security").asString;

				const subscriberSecurityKind = JSON.parse(topicSecurity).subscriberSecurityKind;
				const subscriberSecurityToken = JSON.parse(topicSecurity).subscriberSecurityToken;

				if (topicData.subscriberSecurity.kind !== subscriberSecurityKind
					|| topicData.subscriberSecurity.token !== subscriberSecurityToken) {
					throw new ForbiddenPersistentStorageError(`Wrong Subscriber Security Kind or Subscriber Security Token`);
				}

				const deleteDate = topicSelect[0].get("utc_delete_date").asNullableDate;
				if (deleteDate) {
					// Topic already deleted
					throw new BadRequestPersistentStorageError(`Topic ${topicData.topicName} already deleted`);
				}

			} else {
				// Topic does not exist
				throw new BadRequestPersistentStorageError(`Topic with this name '${topicData.topicName}' does not exist`);
			}
			// const sqlAddWebHook = "INSERT INTO";

			// const sqlInsert = `INSERT INTO ${tablename} (`
			// 	+ "topic_id, url, connection_details) VALUES ("
			// 	+ `'${topic.name}', '${topic.description}', '${topicSecurity}', '${publisherSecurity}', '${subscriberSecurity}');`;

			return {} as any;
		} catch (e) {
			return {} as any;
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

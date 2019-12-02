import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable, Disposable } from "@zxteam/disposable";

import { PostgresProviderFactory } from "@zxteam/sql-postgres";

import { PersistentStorage, Table } from "./PersistentStorage";
import * as _ from "lodash";

import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";
import { SqlProvider, SqlResultRecord } from "@zxteam/sql";

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
		topicData: Topic.Data & Topic.TopicSecurity & Topic.PublisherSecurity & Topic.SubscriberSecurity
	): Promise<Topic> {
		this.verifyInitializedAndNotDisposed();
		try {
			const pathToTable = this.fullPathToTable(Table.TOPIC);

			const topicSecurity = JSON.stringify({
				topicSecurityKind: topicData.topicSecurityKind,
				topicSecurityToken: topicData.topicSecurityToken
			});
			const publisherSecurity = JSON.stringify({
				publisherSecurityKind: topicData.publisherSecurityKind,
				publisherSecurityToken: topicData.publisherSecurityToken
			});
			const subscriberSecurity = JSON.stringify({
				subscriberSecurityKind: topicData.subscriberSecurityKind,
				subscriberSecurityToken: topicData.subscriberSecurityToken
			});

			const sqlInsert = `INSERT INTO ${pathToTable} (`
				+ "name, description, topic_security, publisher_security, subscriber_security) VALUES ("
				+ `'${topicData.name}', '${topicData.description}', '${topicSecurity}', '${publisherSecurity}', '${subscriberSecurity}');`;

			const sqlSelect = "SELECT id, name, description, topic_security, publisher_security, subscriber_security "
				+ `FROM ${pathToTable} WHERE name='${topicData.name}'`;

			const topicResult: ReadonlyArray<SqlResultRecord>
				= await this._sqlProviderFactory.usingProviderWithTransaction(cancellationToken, async (sqlProvider: SqlProvider) => {
					await sqlProvider.statement(sqlInsert).execute(cancellationToken);
					return await sqlProvider.statement(sqlSelect).executeQuery(cancellationToken);
				});

			const topic = topicResult[0];
			const friendlyTopic: Topic = {
				topicId: topic.get("id").asNumber.toString(),
				name: topic.get("name").asString,
				description: topic.get("description").asString,
				topicSecurityKind: JSON.parse(topic.get("topic_security").asString).topicSecurityKind,
				topicSecurityToken: JSON.parse(topic.get("topic_security").asString).topicSecurityToken,
				publisherSecurityToken: JSON.parse(topic.get("publisher_security").asString).publisherSecurityToken,
				publisherSecurityKind: JSON.parse(topic.get("publisher_security").asString).publisherSecurityKind,
				subscriberSecurityKind: JSON.parse(topic.get("subscriber_security").asString).subscriberSecurityKind,
				subscriberSecurityToken: JSON.parse(topic.get("subscriber_security").asString).subscriberSecurityToken
			};

			return friendlyTopic;
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
				.statement(`SELECT "id", "name", "description" FROM ${this.fullPathToTable}topics;`)
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

	public addSubscriberWebhook(
		cancellationToken: CancellationToken,
		webhookData: Webhook.Data
	): Promise<Webhook.Id> {
		throw new Error("");
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

	private fullPathToTable(table: Table) {
		return this._url.pathname.substr(1) + ".public." + table;
	}

}

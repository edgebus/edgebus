import { CancellationToken } from "@zxteam/contract";
import { SqlProvider, SqlResultRecord, SqlData } from "@zxteam/sql";
import { Topic } from "../../model/Topic";
import { Publisher } from "../../model/Publisher";
import { Subscriber } from "../../model/Subscriber";
import { InvalidOperationError } from "@zxteam/errors";
import { Security as SecurityModel } from "../../model/Security";

export namespace TopicStorage {
	export interface Id {
		readonly topicId: number;
	}
	export interface Data {
		readonly name: string;
		readonly description: string;
		readonly mediaType: string;
		readonly topicSecurity: SecurityModel;
		readonly publisherSecurity: SecurityModel;
		readonly subscriberSecurity: SecurityModel;
	}
	export interface Timestamps {
		readonly createAt: Date;
		readonly deleteAt: Date | null;
	}
	export async function getById(
		cancellationToken: CancellationToken,
		id: string,
		sqlProvider: SqlProvider
	): Promise<ITopicStorage> {

		const sqlRow: SqlResultRecord = await sqlProvider.statement(
			"SELECT id, name, description, media_type, topic_security, "
			+ "publisher_security, subscriber_security, utc_create_date, utc_delete_date "
			+ "FROM topic WHERE topicId=$1;"
		).executeSingle(cancellationToken, id);

		return mapDbRow(sqlRow);
	}
	export async function getByName(
		cancellationToken: CancellationToken,
		topicName: TopicStorage.Data["name"],
		sqlProvider: SqlProvider
	): Promise<ITopicStorage> {
		const sqlRow: SqlResultRecord = await sqlProvider.statement(
			"SELECT id, name, description, media_type, topic_security, "
			+ "publisher_security, subscriber_security, utc_create_date, utc_delete_date "
			+ "FROM topic WHERE name=$1;"
		).executeSingle(cancellationToken, topicName);

		return mapDbRow(sqlRow);
	}
	export async function getAll(
		cancellationToken: CancellationToken,
		sqlProvider: SqlProvider,
		filter?: { enabled?: boolean }
	): Promise<Array<ITopicStorage>> {
		throw new InvalidOperationError("Method does not have implementation yet");
	}
	export async function save(
		cancellationToken: CancellationToken,
		sqlProvider: SqlProvider,
		data: Topic.Data & Topic.Security & Publisher.Security & Subscriber.Security
	): Promise<ITopicStorage> {
		const topicSecurity = JSON.stringify({
			kind: data.topicSecurity.kind,
			token: data.topicSecurity.token
		});
		const publisherSecurity = JSON.stringify({
			kind: data.publisherSecurity.kind,
			token: data.publisherSecurity.token
		});
		const subscriberSecurity = JSON.stringify({
			kind: data.subscriberSecurity.kind,
			token: data.subscriberSecurity.token
		});

		const sqlInsert
			= "INSERT INTO topic (name, description, media_type, topic_security, publisher_security, subscriber_security) VALUES ($1, $2, $3, $4, $5, $6);";
		const sqlInsertValue = [
			data.topicName,
			data.topicDescription,
			data.mediaType,
			topicSecurity,
			publisherSecurity,
			subscriberSecurity
		];

		const sqlSelect
			= "SELECT id, name, description, media_type, topic_security, publisher_security, subscriber_security, utc_create_date, utc_delete_date FROM topic WHERE name=$1";
		const sqlSelectValue = [data.topicName];

		await sqlProvider.statement(sqlInsert).execute(cancellationToken, ...sqlInsertValue);
		const sqlRow: SqlResultRecord = await sqlProvider.statement(sqlSelect).executeSingle(cancellationToken, ...sqlSelectValue);

		return mapDbRow(sqlRow);

	}
	export async function isExsistByName(
		cancellationToken: CancellationToken,
		topicName: TopicStorage.Data["name"],
		sqlProvider: SqlProvider
	): Promise<boolean> {
		const sqlRow: SqlData | null = await sqlProvider.statement(
			"SELECT id FROM topic WHERE name=$1;"
		).executeScalarOrNull(cancellationToken, topicName);

		return sqlRow ? true : false;
	}
}
export type ITopicStorage = TopicStorage.Id & TopicStorage.Data & TopicStorage.Timestamps;

function mapDbRow(sqlRow: SqlResultRecord): ITopicStorage {
	const topicSecurity = sqlRow.get("topic_security").asString;
	const publisherSecurity = sqlRow.get("publisher_security").asString;
	const subscriberSecurity = sqlRow.get("subscriber_security").asString;

	const dirtyCreatedAt: Date = sqlRow.get("utc_create_date").asDate;
	const dirtyDeletedAt: Date | null = sqlRow.get("utc_delete_date").asNullableDate;

	return Object.freeze({
		topicId: sqlRow.get("id").asInteger,
		name: sqlRow.get("name").asString,
		description: sqlRow.get("description").asString,
		mediaType: sqlRow.get("media_type").asString,
		topicSecurity: JSON.parse(topicSecurity),
		publisherSecurity: JSON.parse(publisherSecurity),
		subscriberSecurity: JSON.parse(subscriberSecurity),
		createAt: new Date(dirtyCreatedAt.getTime() - dirtyCreatedAt.getTimezoneOffset() * 60000), // convert from UTC
		deleteAt: dirtyDeletedAt ? new Date(dirtyDeletedAt.getTime() - dirtyDeletedAt.getTimezoneOffset() * 60000) : null
	});
}

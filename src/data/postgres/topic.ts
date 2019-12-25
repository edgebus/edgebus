import { CancellationToken } from "@zxteam/contract";
import { SqlProvider, SqlResultRecord, SqlData } from "@zxteam/sql";
import { InvalidOperationError } from "@zxteam/errors";

import { Topic } from "../../model/Topic";
import { Webhook } from "../../model/Webhook";
import { Publisher } from "../../model/Publisher";
import { Subscriber } from "../../model/Subscriber";

export async function getByName(
	cancellationToken: CancellationToken,
	sqlProvider: SqlProvider,
	topicName: Topic.Name["topicName"]
): Promise<Topic> {
	const sqlRow: SqlResultRecord = await sqlProvider.statement(
		"SELECT id, name, description, media_type, topic_security, "
		+ "publisher_security, subscriber_security, utc_create_date, utc_delete_date "
		+ "FROM topic WHERE name=$1"
	).executeSingle(cancellationToken, topicName);

	return mapDbRow(sqlRow);
}
export async function getAll(
	cancellationToken: CancellationToken,
	sqlProvider: SqlProvider,
	filter?: { enabled?: boolean }
): Promise<Array<Topic>> {
	throw new InvalidOperationError("Method does not have implementation yet");
}
export async function save(
	cancellationToken: CancellationToken,
	sqlProvider: SqlProvider,
	data: Topic.Data & Topic.Security & Publisher.Security & Subscriber.Security
): Promise<Topic> {
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
		= "INSERT INTO topic (name, description, media_type, topic_security, publisher_security, subscriber_security) VALUES ($1, $2, $3, $4, $5, $6)";
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
export async function updateDeleteDate(
	cancellationToken: CancellationToken,
	sqlProvider: SqlProvider,
	topicName: Topic.Name["topicName"]
): Promise<void> {

	const sql = "UPDATE topic SET utc_delete_date=(NOW() AT TIME ZONE 'utc') WHERE name=$1";

	await sqlProvider.statement(sql).execute(cancellationToken, topicName);
}
export async function isExsistByName(
	cancellationToken: CancellationToken,
	sqlProvider: SqlProvider,
	topicName: Topic.Name["topicName"]
): Promise<boolean> {
	const sqlRow: SqlData | null = await sqlProvider.statement(
		"SELECT id FROM topic WHERE name=$1"
	).executeScalarOrNull(cancellationToken, topicName);

	return sqlRow ? true : false;
}
export async function getTopicByWebhookId(
	cancellationToken: CancellationToken,
	sqlProvider: SqlProvider,
	webhookId: Webhook.Id["webhookId"]
): Promise<Topic> {
	const sqlRow: SqlResultRecord = await sqlProvider.statement(
		"SELECT t.id, t.name, t.description, t.media_type, t.topic_security, t.publisher_security, "
		+ "t.subscriber_security, t.utc_create_date, t.utc_delete_date FROM topic AS t "
		+ "WHERE t.id=(SELECT w.topic_id FROM subscriber_webhook AS w WHERE w.webhook_id='$1')"
	).executeSingle(cancellationToken, webhookId);

	return mapDbRow(sqlRow);
}

function mapDbRow(sqlRow: SqlResultRecord): Topic {
	const topicSecurity = sqlRow.get("topic_security").asString;
	const publisherSecurity = sqlRow.get("publisher_security").asString;
	const subscriberSecurity = sqlRow.get("subscriber_security").asString;

	const dirtyCreatedAt: Date = sqlRow.get("utc_create_date").asDate;
	const dirtyDeletedAt: Date | null = sqlRow.get("utc_delete_date").asNullableDate;

	const topic: Topic = {
		topicName: sqlRow.get("name").asString,
		topicDescription: sqlRow.get("description").asString,
		mediaType: sqlRow.get("media_type").asString,
		topicSecurity: JSON.parse(topicSecurity),
		publisherSecurity: JSON.parse(publisherSecurity),
		subscriberSecurity: JSON.parse(subscriberSecurity),
		createAt: new Date(dirtyCreatedAt.getTime() - dirtyCreatedAt.getTimezoneOffset() * 60000), // convert from UTC
		deleteAt: dirtyDeletedAt ? new Date(dirtyDeletedAt.getTime() - dirtyDeletedAt.getTimezoneOffset() * 60000) : null
	};

	return topic;
}

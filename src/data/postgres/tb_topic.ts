import { CancellationToken } from "@zxteam/contract";
import { InvalidOperationError } from "@zxteam/errors";
import { SqlProvider, SqlResultRecord, SqlData } from "@zxteam/sql";

import { Security } from "../../model/Security";
import { Topic } from "../../model/Topic";

export async function create(
	cancellationToken: CancellationToken,
	sqlProvider: SqlProvider,
	topicSecurity: Security,
	data: Topic.Id & Topic.Data
): Promise<Topic> {
	const sqlCreateAtScalar: SqlData = await sqlProvider.statement(
		'INSERT INTO "tb_topic" (' +
		'"domain", "name", "description", "media_type", "topic_security"' +
		") VALUES ($1, $2, $3, $4, $5) " +
		'RETURNING "utc_create_date"'
	).executeScalar(cancellationToken,
		data.topicDomain, // 1
		data.topicName, // 2
		data.topicDescription, // 3
		data.topicMediaType, // 4
		JSON.stringify(topicSecurity) // 5
	);

	const dirtyCreatedAt: Date = sqlCreateAtScalar.asDate;

	const topic: Topic = Object.freeze({
		topicDomain: data.topicDomain,
		topicName: data.topicName,
		topicDescription: data.topicDescription,
		topicMediaType: data.topicMediaType,
		topicSecurity: topicSecurity,
		createAt: new Date(dirtyCreatedAt.getTime() - dirtyCreatedAt.getTimezoneOffset() * 60000), // convert from UTC
		deleteAt: null
	});

	return topic;
}

export async function list(
	cancellationToken: CancellationToken,
	sqlProvider: SqlProvider,
	domain: string | null
	//	filter?: { enabled?: boolean }
): Promise<Array<Topic>> {
	const sqlRows: ReadonlyArray<SqlResultRecord> = await sqlProvider.statement(
		'SELECT "id", "domain", "name", "description", "media_type", ' +
		'"utc_create_date", "utc_delete_date" ' +
		'FROM "tb_topic" WHERE $1::varchar IS NULL OR "domain" = $1::varchar'
	).executeQuery(cancellationToken, domain);

	return sqlRows.map(mapDbRow);
}

// export async function getByName(
// 	cancellationToken: CancellationToken,
// 	sqlProvider: SqlProvider,
// 	topicName: Topic["topicName"]
// ): Promise<Topic> {
// 	const sqlRow: SqlResultRecord = await sqlProvider.statement(
// 		'SELECT "id", "name", "description", "media_type", "topic_security", ' +
// 		'"publisher_security", "subscriber_security", "utc_create_date", "utc_delete_date" ' +
// 		'FROM "topic" WHERE "name" = $1;'
// 	).executeSingle(cancellationToken, topicName);

// 	return mapDbRow(sqlRow);
// }

// export async function setDeleteDate(
// 	cancellationToken: CancellationToken,
// 	sqlProvider: SqlProvider,
// 	topicName: Topic.Id["topicName"]
// ): Promise<void> {
// 	const currentDeleteDate = await sqlProvider
// 		.statement('SELECT "utc_delete_date" FROM "topic" WHERE "name" = $1')
// 		.executeScalar(cancellationToken, topicName);

// 	if (currentDeleteDate.asNullableDate !== null) {
// 		throw new InvalidOperationError(
// 			`Wrong operation. A delete date of topic '${topicName}' already set. Update not allowed.`
// 		);
// 	}

// 	await sqlProvider.statement(
// 		`UPDATE "topic" SET "utc_delete_date"=(NOW() AT TIME ZONE 'utc') WHERE "name" = $1`
// 	).execute(cancellationToken, topicName);
// }
// export async function isExsistByName(
// 	cancellationToken: CancellationToken,
// 	sqlProvider: SqlProvider,
// 	topicName: Topic.Id["topicName"]
// ): Promise<boolean> {
// 	const sqlRow: SqlData | null = await sqlProvider.statement(
// 		`SELECT "id" FROM "topic" WHERE "name" = $1`
// 	).executeScalarOrNull(cancellationToken, topicName);

// 	return sqlRow ? true : false;
// }
// export async function getTopicByWebhookId(
// 	cancellationToken: CancellationToken,
// 	sqlProvider: SqlProvider,
// 	subscriberId: Subscriber["subscriberId"]
// ): Promise<Topic> {
// 	const sqlRow: SqlResultRecord = await sqlProvider.statement(
// 		"SELECT t.id, t.name, t.description, t.media_type, t.topic_security, t.publisher_security, "
// 		+ "t.subscriber_security, t.utc_create_date, t.utc_delete_date FROM topic AS t "
// 		+ "WHERE t.id=(SELECT w.topic_id FROM subscriber_webhook AS w WHERE w.webhook_id='$1')"
// 	).executeSingle(cancellationToken, subscriberId);

// 	return mapDbRow(sqlRow);
// }

function mapDbRow(sqlRow: SqlResultRecord): Topic {
	const topicDomain: string | null = sqlRow.get("domain").asNullableString;
	const topicName: string = sqlRow.get("name").asString;
	const topicDescription: string = sqlRow.get("description").asString;
	const topicMediaType: string = sqlRow.get("media_type").asString;
	const dirtyCreatedAt: Date = sqlRow.get("utc_create_date").asDate;
	const dirtyDeletedAt: Date | null = sqlRow.get("utc_delete_date").asNullableDate;

	const topic: Topic = {
		topicName,
		topicDomain,
		topicDescription,
		topicMediaType,
		createAt: new Date(dirtyCreatedAt.getTime() - dirtyCreatedAt.getTimezoneOffset() * 60000), // convert from UTC
		deleteAt: dirtyDeletedAt ? new Date(dirtyDeletedAt.getTime() - dirtyDeletedAt.getTimezoneOffset() * 60000) : null
	};

	return topic;
}
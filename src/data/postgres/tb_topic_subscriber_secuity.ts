import { FSqlConnection, FSqlResultRecord, FSqlData, FExecutionContext } from "@freemework/common";

import { Security } from "../../model/Security";
import { Topic } from "../../model/Topic";

export async function create(
	executionContext: FExecutionContext,
	sqlProvider: FSqlConnection,
	topicId: Topic.Id,
	subscriberSecurity: Security
): Promise<void> {
	const subscriberSecurityJson: string = JSON.stringify({
		kind: subscriberSecurity.kind,
		token: subscriberSecurity.token
	});

	const sqlCreateAtScalar: FSqlData = await sqlProvider.statement(
		'INSERT INTO "tb_topic_subscriber_secuity" (' +
		'"topic_id", "subscriber_security"' +
		') VALUES ((SELECT "id" FROM "topic" WHERE "name" = $2 AND ($1 IS NULL OR "domain" = $1)), $3) ' +
		'RETURNING "utc_create_date"'
	).executeScalar(executionContext,
		topicId.topicDomain, // 1
		topicId.topicName, // 2
		subscriberSecurityJson // 3
	);

	// const dirtyCreatedAt: Date = sqlCreateAtScalar.asDate;
	// const createAt = new Date(dirtyCreatedAt.getTime() - dirtyCreatedAt.getTimezoneOffset() * 60000), // convert from UTC

	return;
}

export async function findNonDeletedRecordId(
	executionContext: FExecutionContext,
	sqlProvider: FSqlConnection,
	topicId: Topic.Id,
	subscriberSecurity: Security
): Promise<number | null> {
	const subscriberSecurityJson: string = JSON.stringify({
		kind: subscriberSecurity.kind,
		token: subscriberSecurity.token
	});

	const sqlIdScalar: FSqlData | null = await sqlProvider.statement(
		'SELECT "id" FROM "tb_topic_subscriber_secuity" ' +
		'WHERE "topic_id" = (SELECT "id" FROM "topic" WHERE "name" = $2 AND ($1 IS NULL OR "domain" = $1)) ' +
		' AND "utc_delete_date" IS NULL AND "subscriber_security" @> $3'
	).executeScalarOrNull(executionContext,
		topicId.topicDomain, // 1
		topicId.topicName, // 2
		subscriberSecurityJson // 3
	);

	return sqlIdScalar !== null ? sqlIdScalar.asInteger : null;
}

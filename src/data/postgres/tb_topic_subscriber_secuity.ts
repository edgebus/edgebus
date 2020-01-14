import { CancellationToken } from "@zxteam/contract";
import { SqlProvider, SqlResultRecord, SqlData } from "@zxteam/sql";

import { Security } from "../../model/Security";
import { Topic } from "../../model/Topic";

export async function create(
	cancellationToken: CancellationToken,
	sqlProvider: SqlProvider,
	topicId: Topic.Id,
	subscriberSecurity: Security
): Promise<void> {
	const subscriberSecurityJson: string = JSON.stringify({
		kind: subscriberSecurity.kind,
		token: subscriberSecurity.token
	});

	const sqlCreateAtScalar: SqlData = await sqlProvider.statement(
		'INSERT INTO "tb_topic_subscriber_secuity" (' +
		'"topic_id", "subscriber_security"' +
		') VALUES ((SELECT "id" FROM "topic" WHERE "name" = $2 AND ($1 IS NULL OR "domain" = $1)), $3) ' +
		'RETURNING "utc_create_date"'
	).executeScalar(cancellationToken,
		topicId.topicDomain, // 1
		topicId.topicName, // 2
		subscriberSecurityJson // 3
	);

	// const dirtyCreatedAt: Date = sqlCreateAtScalar.asDate;
	// const createAt = new Date(dirtyCreatedAt.getTime() - dirtyCreatedAt.getTimezoneOffset() * 60000), // convert from UTC

	return;
}

export async function findNonDeletedRecordId(
	cancellationToken: CancellationToken,
	sqlProvider: SqlProvider,
	topicId: Topic.Id,
	subscriberSecurity: Security
): Promise<number | null> {
	const subscriberSecurityJson: string = JSON.stringify({
		kind: subscriberSecurity.kind,
		token: subscriberSecurity.token
	});

	const sqlIdScalar: SqlData | null = await sqlProvider.statement(
		'SELECT "id" FROM "tb_topic_subscriber_secuity" ' +
		'WHERE "topic_id" = (SELECT "id" FROM "topic" WHERE "name" = $2 AND ($1 IS NULL OR "domain" = $1)) ' +
		' AND "utc_delete_date" IS NULL AND "subscriber_security" @> $3'
	).executeScalarOrNull(cancellationToken,
		topicId.topicDomain, // 1
		topicId.topicName, // 2
		subscriberSecurityJson // 3
	);

	return sqlIdScalar !== null ? sqlIdScalar.asInteger : null;
}

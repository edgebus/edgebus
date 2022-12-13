import { FSqlProvider, FSqlResultRecord, FSqlData, FExecutionContext } from "@freemework/common";

import { Security } from "../../model/Security";
import { Topic } from "../../model/Topic";

export async function create(
	executionContext: FExecutionContext,
	sqlProvider: FSqlProvider,
	topicId: Topic.Id,
	publisherSecurity: Security
): Promise<void> {
	const publisherSecurityJson: string = JSON.stringify({
		kind: publisherSecurity.kind,
		token: publisherSecurity.token
	});

	const sqlCreateAtScalar: FSqlData = await sqlProvider.statement(
		'INSERT INTO "tb_topic_publisher_secuity" (' +
		'"topic_id", "publisher_security"' +
		') VALUES ((SELECT "id" FROM "topic" WHERE "name" = $2 AND ($1 IS NULL OR "domain" = $1)), $3) ' +
		'RETURNING "utc_create_date"'
	).executeScalar(executionContext,
		topicId.topicDomain, // 1
		topicId.topicName, // 2
		publisherSecurityJson // 3
	);

	// const dirtyCreatedAt: Date = sqlCreateAtScalar.asDate;
	// const createAt = new Date(dirtyCreatedAt.getTime() - dirtyCreatedAt.getTimezoneOffset() * 60000), // convert from UTC

	return;
}

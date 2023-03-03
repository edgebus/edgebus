import { FExecutionContext, FSqlConnection, FSqlResultRecord } from "@freemework/common";

import { v4 as uuid } from "uuid";
import * as _ from "lodash";

import { Topic } from "../../model/topic";
import { Publisher } from "../../model/publisher";
import { Converter } from "../../model/convert";
import { Security } from "../../model/security";

export async function create<TVariant extends Publisher.DataVariant>(
	executionContext: FExecutionContext,
	sqlProvider: FSqlConnection,
	publisherSecurity: Security,
	variant: TVariant
): Promise<Publisher<TVariant>> {
	const publisherUuid: string = uuid();

	const topicId: Topic.Id = variant.topicId;

	const sqlScalar = await sqlProvider.statement(
		'INSERT INTO "tb_publisher" (' +
		'"publisher_uuid", "topic_id", "data"' +
		') VALUES ($1, (SELECT "id" FROM "topic" WHERE "name" = $2 AND ($3 IS NULL OR "domain" = $3)), $4) ' +
		'RETURNING "utc_create_date"'
	).executeScalar(executionContext,
		publisherUuid, topicId.topicName, topicId.topicDomain, JSON.stringify(_.omit(variant, "topicId"))
	);

	const dirtyCreateAt: Date = sqlScalar.asDate;
	const createAt: Date = new Date(
		dirtyCreateAt.getTime() - dirtyCreateAt.getTimezoneOffset() * 60000
	); // convert from UTC

	const publisher: Publisher<TVariant> = {
		...variant,
		kind: variant.kind,
		converters: variant.converters,
		topicId: variant.topicId,
		publisherId: publisherUuid,
		createAt,
		deleteAt: null
	};

	return publisher;
}

// export async function getById(
// 	executionContext: FExecutionContext,
// 	sqlProvider: SqlProvider,
// 	id: Publisher["publisherId"]
// ): Publisher {
// 	// CREATE TABLE "tb_publisher" (
// 	// 	"id" SERIAL NOT NULL PRIMARY KEY,
// 	// 	"publisher_uuid" UUID NOT NULL,
// 	// 	"topic_id" INT REFERENCES "tb_topic"("id") NOT NULL,
// 	// 	"destroy_security" JSONB NOT NULL,
// 	// 	"opts" JSONB NOT NULL,
// 	// 	"converts" JSONB NOT NULL,
// 	// 	"utc_create_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
// 	// 	CONSTRAINT "uq__tb_publisher__publisher_uuid" UNIQUE ("publisher_uuid")
// 	// );

// }

// function mapDbRow(sqlRow: SqlResultRecord): Publisher {
// 	const sslOption = sqlRow.get("ssl_opts").asObject;
// 	const publisherSecurity = sqlRow.get("publisher_security").asString;

// 	const dirtyCreatedAt: Date = sqlRow.get("utc_create_date").asDate;
// 	const dirtyDeletedAt: Date | null = sqlRow.get("utc_delete_date").asNullableDate;

// 	const publisher: Publisher = {
// 		publisherId: sqlRow.get("id").asString,
// 		sslOption,
// 		publisherSecurity: JSON.parse(publisherSecurity),
// 		createAt: new Date(dirtyCreatedAt.getTime() - dirtyCreatedAt.getTimezoneOffset() * 60000), // convert from UTC
// 		deleteAt: dirtyDeletedAt ? new Date(dirtyDeletedAt.getTime() - dirtyDeletedAt.getTimezoneOffset() * 60000) : null
// 	};

// 	return publisher;
// }

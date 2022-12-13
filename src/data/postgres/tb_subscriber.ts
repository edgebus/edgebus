import { FExecutionContext, FSqlProvider, FSqlResultRecord } from "@freemework/common";

import { v4 as uuid } from "uuid";
import * as _ from "lodash";

// Model
import { Topic } from "../../model/Topic";
import { Subscriber } from "../../model/Subscriber";

// SQL Tools
import * as sqlToolsTopicSubscriberSecurity from "./tb_topic_subscriber_secuity";
import * as sqlToolsTopic from "./tb_topic";
import { NoRecordPersistentStorageError } from "../errors";
import { Security } from "../../model/Security";

export async function create<TVariant extends Subscriber.DataVariant>(
	executionContext: FExecutionContext,
	sqlProvider: FSqlProvider,
	subscriberSecurity: Security,
	variant: TVariant
): Promise<Subscriber<TVariant>> {
	const topicId: Topic.Id = variant.topicId;

	const topicSubscriberSecuityId: number | null = await sqlToolsTopicSubscriberSecurity
		.findNonDeletedRecordId(executionContext, sqlProvider, topicId, subscriberSecurity);

	if (topicSubscriberSecuityId === null) {
		throw new NoRecordPersistentStorageError("Topic's subscriber security record was not found");
	}

	const subscriberUuid: string = uuid();

	const sqlCreateAtScalar = await sqlProvider.statement(
		'INSERT INTO "tb_subscriber" (' +
		'"subscriber_uuid", "topic_subscriber_secuity_id", "data"' +
		") VALUES ($1, $2, $4) " +
		'RETURNING "utc_create_date"'
	).executeScalar(executionContext,
		subscriberUuid, topicSubscriberSecuityId, JSON.stringify(_.omit(variant, "topicId"))
	);

	const dirtyCreateAt: Date = sqlCreateAtScalar.asDate;
	const createAt: Date = new Date(
		dirtyCreateAt.getTime() - dirtyCreateAt.getTimezoneOffset() * 60000
	); // convert from UTC

	const subscriber: Subscriber<TVariant> = {
		...variant,
		kind: variant.kind,
		converters: variant.converters,
		topicId: variant.topicId,
		subscriberId: subscriberUuid,
		createAt,
		deleteAt: null
	};

	return subscriber;
}

// export async function setDeleteDate(
// 	executionContext: FExecutionContext,
// 	sqlProvider: SqlProvider,
// 	subscriberId: Subscriber["subscriberId"]
// ): Promise<void> {
// 	const currentDeleteDate = await sqlProvider
// 		.statement('SELECT "utc_delete_date" FROM "tb_subscriber" WHERE "name" = $1')
// 		.executeScalar(cancellationToken, subscriberId);

// 	if (currentDeleteDate.asNullableDate !== null) {
// 		throw new InvalidOperationError(
// 			`Wrong operation. A delete date of subscriber '${subscriberId}' already set. Update not allowed.`
// 		);
// 	}

// 	await sqlProvider.statement(
// 		`UPDATE "tb_subscriber" SET "utc_delete_date"=(NOW() AT TIME ZONE 'utc') WHERE "name" = $1`
// 	).execute(cancellationToken, subscriberId);
// }

// export namespace Webhook {
// 	export interface Id {
// 		/**
//  		* The ID of the Webhook
//  		*/
// 		readonly webhookId: string;
// 	}

// 	export interface Data {
// 		/**
// 		 * ID of attached topic for the Webhook
// 		 */
// 		readonly topicName: Topic.Name["topicName"];

// 		/**
// 		 * The hook URL
// 		 */
// 		readonly url: URL;

// 		/**
// 		 * Trusted ca certificate from client
// 		 */
// 		readonly trustedCaCertificate: string;

// 		/**
// 		 * Header Token from client
// 		 */
// 		readonly headerToken: string;
// 	}

// 	export interface Timestamps {
// 		readonly createAt: Date;
// 		readonly deleteAt: Date | null;
// 	}
// }

// export type Webhook = Webhook.Id & Webhook.Data & Webhook.Timestamps;


// export async function getByWebhookId(
// 	executionContext: FExecutionContext,
// 	sqlProvider: SqlProvider,
// 	subscriberId: Subscriber["subscriberId"]
// ): Promise<Webhook> {
// 	throw new InvalidOperationError("Method does not have implementation yet");
// }
// export async function getByTopicIdActive(
// 	executionContext: FExecutionContext,
// 	sqlProvider: SqlProvider,
// 	topicName: Webhook.Instance["topicName"],
// 	url: Webhook.Data["url"]
// ): Promise<Webhook> {
// 	const record: SqlResultRecord = await sqlProvider.statement(
// 		"SELECT w.id, t.name, w.webhook_id, w.url, w.trusted_ca_certificate, w.header_token, w.utc_create_date, w.utc_delete_date "
// 		+ "FROM subscriber_webhook AS w INNER JOIN topic AS t ON t.id=w.topic_id "
// 		+ "WHERE w.topic_id=(SELECT id FROM topic WHERE name=$1) AND w.url=$2 AND w.utc_delete_date IS NULL;"
// 	).executeSingle(cancellationToken, topicName, url.toString());

// 	return mapDbRow(record);
// }
// export async function getBySecurity(
// 	executionContext: FExecutionContext,
// 	sqlProvider: SqlProvider,
// 	security: Security
// ): Promise<Array<Webhook>> {
// 	const records: ReadonlyArray<SqlResultRecord> = await sqlProvider.statement(
// 		"SELECT w.id, t.name, w.webhook_id, w.topic_id, w.url, w.trusted_ca_certificate, w.header_token, w.utc_create_date, w.utc_delete_date "
// 		+ "FROM subscriber_webhook AS w "
// 		+ "INNER JOIN topic AS t ON t.id=w.topic_id "
// 		+ "WHERE topic_id=(SELECT id FROM topic AS t "
// 		+ "WHERE t.subscriber_security=$1);"
// 	).executeQuery(cancellationToken, JSON.stringify(security));

// 	return records.map((record) => mapDbRow(record));
// }
// export async function getAll(
// 	executionContext: FExecutionContext,
// 	sqlProvider: SqlProvider,
// 	filter?: { enabled?: boolean }
// ): Promise<Array<Webhook>> {
// 	throw new InvalidOperationError("Method does not have implementation yet");
// }
// export async function save(
// 	executionContext: FExecutionContext,
// 	sqlProvider: SqlProvider,
// 	topicName: Topic.Name["topicName"],
// 	webhookData: Webhook.Data
// ): Promise<Webhook> {

// 	const webhookId = "subscriber.webhook." + uuid();
// 	const webhookUrl = webhookData.url.toString();
// 	const trustCaCertificate = webhookData.trustedCaCertificate;
// 	const headerToken = webhookData.headerToken;

// 	await sqlProvider.statement(
// 		"INSERT INTO subscriber_webhook (webhook_id, topic_id, url, trusted_ca_certificate, header_token) "
// 		+ "VALUES ($1, (SELECT id FROM topic WHERE name = $2), $3, $4, $5);"
// 	).execute(cancellationToken, webhookId, topicName, webhookUrl, trustCaCertificate, headerToken);

// 	const sqlRow: Webhook = await getByTopicIdActive(cancellationToken, sqlProvider, topicName, webhookData.url);

// 	return sqlRow;
// }

// function mapDbRow(sqlRow: SqlResultRecord): Webhook {
// 	const dirtyCreatedAt: Date = sqlRow.get("utc_create_date").asDate;
// 	const dirtyDeletedAt: Date | null = sqlRow.get("utc_delete_date").asNullableDate;

// 	const webhookRow: Webhook = {
// 		webhookId: sqlRow.get("webhook_id").asString,
// 		topicName: sqlRow.get("name").asString,
// 		url: new URL(sqlRow.get("url").asString),
// 		trustedCaCertificate: sqlRow.get("trusted_ca_certificate").asString,
// 		headerToken: sqlRow.get("header_token").asString,
// 		createAt: new Date(dirtyCreatedAt.getTime() - dirtyCreatedAt.getTimezoneOffset() * 60000), // convert from UTC
// 		deleteAt: dirtyDeletedAt ? new Date(dirtyDeletedAt.getTime() - dirtyDeletedAt.getTimezoneOffset() * 60000) : null
// 	};

// 	return webhookRow;
// }

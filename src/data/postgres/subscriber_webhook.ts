import { CancellationToken } from "@zxteam/contract";
import { SqlProvider, SqlResultRecord } from "@zxteam/sql";
import { InvalidOperationError } from "@zxteam/errors";

import { v4 as uuid } from "uuid";

// Model
import { Topic } from "../../model/Topic";
import { Security } from "../../model/Security";
import { Subscriber } from "../../model/Subscriber";
import { SubscriberSecurity } from "../../model/SubscriberSecurity";

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
// 	cancellationToken: CancellationToken,
// 	sqlProvider: SqlProvider,
// 	subscriberId: Subscriber["subscriberId"]
// ): Promise<Webhook> {
// 	throw new InvalidOperationError("Method does not have implementation yet");
// }
// export async function getByTopicIdActive(
// 	cancellationToken: CancellationToken,
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
// 	cancellationToken: CancellationToken,
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
// 	cancellationToken: CancellationToken,
// 	sqlProvider: SqlProvider,
// 	filter?: { enabled?: boolean }
// ): Promise<Array<Webhook>> {
// 	throw new InvalidOperationError("Method does not have implementation yet");
// }
// export async function save(
// 	cancellationToken: CancellationToken,
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

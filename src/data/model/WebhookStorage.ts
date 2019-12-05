import { CancellationToken } from "@zxteam/contract";
import { SqlProvider, SqlResultRecord, SqlNoSuchRecordError } from "@zxteam/sql";
import { Topic } from "../../model/Topic";
import { Publisher } from "../../model/Publisher";
import { Subscriber } from "../../model/Subscriber";
import { InvalidOperationError } from "@zxteam/errors";
import { Security as SecurityModel } from "../../model/Security";
import { ITopicStorage, TopicStorage } from "./TopicStorage";
import { Webhook } from "../../model/Webhook";

export namespace WebHookStorage {
	export interface Id {
		readonly webHookId: number;
	}
	export interface Data {
		readonly topicId: number;
		readonly url: URL;
		readonly trustedCaCertificate: string;
		readonly headerToken: string;
	}
	export interface Timestamps {
		readonly createAt: Date;
		readonly deleteAt: Date | null;
	}
	export async function getById(
		cancellationToken: CancellationToken,
		id: string,
		sqlProvider: SqlProvider
	): Promise<IWebHookStorage> {
		throw new InvalidOperationError("Method does not have implementation yet");
	}
	export async function getByTopicIdActive(
		cancellationToken: CancellationToken,
		topicId: WebHookStorage.Data["topicId"],
		url: WebHookStorage.Data["url"],
		sqlProvider: SqlProvider
	): Promise<IWebHookStorage> {
		const sqlRow: SqlResultRecord = await sqlProvider.statement(
			"SELECT id, topic_id, url, trusted_ca_certificate, header_token, utc_create_date, utc_delete_date "
			+ "FROM subscriber_webhook WHERE topic_id=$1 AND url=$2 AND utc_delete_date IS NULL;"
		).executeSingle(cancellationToken, topicId, url.toString());

		return mapDbRow(sqlRow);
	}
	export async function getAll(
		cancellationToken: CancellationToken,
		sqlProvider: SqlProvider,
		filter?: { enabled?: boolean }
	): Promise<Array<IWebHookStorage>> {
		throw new InvalidOperationError("Method does not have implementation yet");
	}
	export async function save(
		cancellationToken: CancellationToken,
		sqlProvider: SqlProvider,
		topicData: ITopicStorage,
		webhookData: Webhook.Data
	): Promise<IWebHookStorage> {

		const topicId = topicData.topicId;
		const webhookUrl = webhookData.url.toString();
		const trustCaCertificate = webhookData.trustedCaCertificate;
		const headerToken = webhookData.headerToken;

		await sqlProvider.statement(
			"INSERT INTO subscriber_webhook (topic_id, url, trusted_ca_certificate, header_token) VALUES ($1, $2, $3, $4);"
		).execute(cancellationToken, topicId, webhookUrl, trustCaCertificate, headerToken);

		const sqlRow: IWebHookStorage = await getByTopicIdActive(cancellationToken, topicId, webhookData.url, sqlProvider);

		return sqlRow;
	}
}
export type IWebHookStorage = WebHookStorage.Id & WebHookStorage.Data & WebHookStorage.Timestamps;

function mapDbRow(sqlRow: SqlResultRecord): IWebHookStorage {
	const dirtyCreatedAt: Date = sqlRow.get("utc_create_date").asDate;
	const dirtyDeletedAt: Date | null = sqlRow.get("utc_delete_date").asNullableDate;

	return Object.freeze({
		webHookId: sqlRow.get("id").asInteger,
		topicId: sqlRow.get("topic_id").asInteger,
		url: new URL(sqlRow.get("url").asString),
		trustedCaCertificate: sqlRow.get("trusted_ca_certificate").asString,
		headerToken: sqlRow.get("header_token").asString,
		createAt: new Date(dirtyCreatedAt.getTime() - dirtyCreatedAt.getTimezoneOffset() * 60000), // convert from UTC
		deleteAt: dirtyDeletedAt ? new Date(dirtyDeletedAt.getTime() - dirtyDeletedAt.getTimezoneOffset() * 60000) : null
	});
}

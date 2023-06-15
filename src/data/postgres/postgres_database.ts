import { FExceptionInvalidOperation, FExecutionContext, FSqlResultRecord, FSqlStatementParam } from "@freemework/common";
import { FSqlConnectionFactoryPostgres } from "@freemework/sql.postgres";

import * as _ from "lodash";

import { DeliveryApiIdentifier, EgressApiIdentifier, IngressApiIdentifier, MessageApiIdentifier, TopicApiIdentifier } from "../../misc/api-identifier";
import { Delivery, Egress, Ingress, Message, Topic, ensureEgressKind, ensureIngressKind } from "../../model";
import { SqlDatabase } from "../sql_database";
import { Database } from "../database";

export class PostgresDatabase extends SqlDatabase {
	public constructor(sqlConnectionFactory: FSqlConnectionFactoryPostgres) {
		super(sqlConnectionFactory);
	}

	public async createDelivery(
		executionContext: FExecutionContext,
		deliveryData: Partial<Delivery.Id> & Delivery.Data
	): Promise<Delivery> {
		this.verifyInitializedAndNotDisposed();

		const deliveryId: DeliveryApiIdentifier = deliveryData.deliveryId ?? new DeliveryApiIdentifier();

		const sqlCreatedSate = await this.sqlConnection
			.statement(`
					INSERT INTO "tb_egress_delivery"(
						"api_uuid",
						"egress_id",
						"topic_id",
						"message_id",
						"egress_topic_id",
						"status",
						"success_evidence",
						"failure_evidence"
					)
					VALUES (
						$1,
						(SELECT "id" FROM "tb_egress" WHERE "api_uuid" = $2),
						(SELECT "id" FROM "tb_topic" WHERE "api_uuid" = $3),
						(SELECT "id" FROM "tb_message" WHERE "api_uuid" = $4),
						(
							SELECT "id" FROM "tb_egress_topic"
							WHERE "topic_id" = (
									SELECT "id" FROM "tb_topic" WHERE "api_uuid" = $3
								)
								AND "utc_deleted_date" IS NULL
								AND "egress_id" = (
									SELECT "id" FROM "tb_egress" WHERE "api_uuid" = $2
								)
						),
						$5,
						$6,
						$7
					)
					RETURNING "utc_created_date"
				`)
			.executeScalar(
				executionContext,
				/* 1 */deliveryId.uuid,
				/* 2 */deliveryData.egressId.uuid,
				/* 3 */deliveryData.topicId.uuid,
				/* 4 */deliveryData.messageId.uuid,
				/* 5 */deliveryData.status,
				/* 6 */JSON.stringify(deliveryData.status === Delivery.Status.Success ? deliveryData.successEvidence : null),
				/* 7 */JSON.stringify(deliveryData.status === Delivery.Status.Failure ? deliveryData.failure_evidence : null),
			);

		const deliveryModel: Delivery = {
			...deliveryData,
			deliveryId,
			deliverCreatedAt: sqlCreatedSate.asDate,
		};
		return deliveryModel;
	}

	public async createEgress(
		executionContext: FExecutionContext,
		egressData: Partial<Egress.Id> & Egress.Data
	): Promise<Egress> {
		this.verifyInitializedAndNotDisposed();

		const egressId: EgressApiIdentifier = egressData.egressId ?? new EgressApiIdentifier();

		const egressMainRecord: FSqlResultRecord = await this.sqlConnection
			.statement(`
				INSERT INTO "tb_egress"("kind", "api_uuid")
				VALUES ($1, $2)
				RETURNING "id", "kind", "api_uuid", "utc_created_date", "utc_deleted_date"
			`)
			.executeSingle(
				executionContext,
				/* 1 */egressData.egressKind,
				/* 2 */egressId.uuid
			);
		const egressDbId: number = egressMainRecord.get("id").asNumber; // INT

		let egressExtRecord: FSqlResultRecord;
		switch (egressData.egressKind) {
			case Egress.Kind.WebSocketHost:
				egressExtRecord = await this.sqlConnection
					.statement(`
						INSERT INTO "tb_egress_websockethost"(
							"id", "kind"
						)
						VALUES (
							$1, $2
						)
						RETURNING "id", "kind"
					`)
					.executeSingle(
						executionContext,
						/* 1 */egressMainRecord.get("id").asNumber,
						/* 2 */egressData.egressKind
					);
				break;
			case Egress.Kind.Webhook:
				egressExtRecord = await this.sqlConnection
					.statement(`
						INSERT INTO "tb_egress_webhook"(
							"id", "kind", "http_url", "http_method"
						)
						VALUES (
							$1, $2, $3, $4
						)
						RETURNING "id", "kind", "http_url" AS "webhook_http_url", "http_method" AS "webhook_http_method"
					`)
					.executeSingle(
						executionContext,
						/* 1 */egressDbId,
						/* 2 */egressData.egressKind,
						/* 3 */egressData.egressHttpUrl.toString(),
						/* 4 */egressData.egressHttpMethod,
					);
				break;
			default:
				throw new FExceptionInvalidOperation(`Not supported ingress kind: ${egressData.egressKind}`);
		}

		await this.sqlConnection
			.statement(`
				INSERT INTO "tb_egress_topic"("egress_id", "topic_id")
				SELECT $1::INT, T."id"
				FROM (SELECT unnest($2::UUID[]) AS "topic_uuid") AS INPUT
				LEFT JOIN "tb_topic" AS T ON T."api_uuid" = INPUT."topic_uuid"
				RETURNING "topic_id"
			`)
			.execute(
				executionContext,
				/* 1 */egressDbId,
				/* 2 */egressData.egressTopicIds.map(s => s.uuid)
			);

		const egressModel: Egress = PostgresDatabase._mapEgressDbRow(egressMainRecord, egressExtRecord, egressData.egressTopicIds);
		return egressModel;
	}

	public async createIngress(
		executionContext: FExecutionContext,
		ingressData: Partial<Ingress.Id> & Ingress.Data
	): Promise<Ingress> {
		this.verifyInitializedAndNotDisposed();

		const ingressId: IngressApiIdentifier = ingressData.ingressId ?? new IngressApiIdentifier();

		const sqlMainRecord: FSqlResultRecord = await this.sqlConnection
			.statement(`
				INSERT INTO "tb_ingress"("kind", "api_uuid", "topic_id")
				VALUES (
					$1, $2,
					(
						SELECT "id"
						FROM "tb_topic"
						WHERE "api_uuid" = $3
					)
				)
				RETURNING "id", "kind", "api_uuid", "topic_id", "utc_created_date", "utc_deleted_date"
			`)
			.executeSingle(
				executionContext,
				/* 1 */ingressData.ingressKind,
				/* 2 */ingressId.uuid,
				/* 3 */ingressData.ingressTopicId.uuid,
			);

		let sqlExtendedRecord: FSqlResultRecord;

		switch (ingressData.ingressKind) {
			case Ingress.Kind.HttpHost:

				sqlExtendedRecord = await this.sqlConnection
					.statement(`
						INSERT INTO "tb_ingress_httphost"(
							"id", "kind", "path", "response_status_code", "response_status_message", "response_headers", "response_body"
						)
						VALUES (
							$1, $2, $3, $4, $5, $6, $7
						)
						RETURNING "id", "kind", "path", "response_status_code", "response_status_message", "response_headers", "response_body"
					`)
					.executeSingle(
						executionContext,
						/* 1 */sqlMainRecord.get("id").asNumber,
						/* 2 */ingressData.ingressKind,
						/* 3 */ingressData.ingressHttpHostPath,
						/* 4 */ingressData.ingressHttpHostResponseStatusCode,
						/* 5 */ingressData.ingressHttpHostResponseStatusMessage,
						/* 6 */JSON.stringify(ingressData.ingressHttpHostResponseHeaders),
						/* 7 */ingressData.ingressHttpHostResponseBody,
					);
				break;
			default:
				throw new FExceptionInvalidOperation(`Not supported ingress kind: ${ingressData.ingressKind}`);
		}

		const ingressModel: Ingress = PostgresDatabase._mapIngressDbRow(sqlMainRecord, sqlExtendedRecord, ingressData.ingressTopicId.uuid);
		return ingressModel;
	}

	public async createMessage(
		executionContext: FExecutionContext,
		ingressApiId: IngressApiIdentifier,
		messageApiId: MessageApiIdentifier,
		headers: Message.Headers,
		mimeType: string | null,
		originalBody: Uint8Array | null,
		body: Uint8Array | null,
	): Promise<void> {
		this.verifyInitializedAndNotDisposed();

		const messageResultRecord: FSqlResultRecord = await this.sqlConnection
			.statement(`
				INSERT INTO "tb_message" ("api_uuid", "headers", "media_type", "body", "original_body", "ingress_id", "topic_id")
				SELECT
					INPUT."api_uuid",
					INPUT."headers",
					INPUT."media_type",
					INPUT."body",
					INPUT."original_body",
					SUB."id" AS "ingress_id",
					SUB."topic_id"
				FROM (SELECT
					$1::UUID as "api_uuid",
					$2::JSONB AS "headers",
					$3::TEXT AS "media_type",
					$4::BYTEA AS "body",
					$5::BYTEA AS "original_body",
					$6::UUID AS "ingress_uuid"
				) AS INPUT
				LEFT JOIN "tb_ingress" AS SUB ON SUB."api_uuid" = INPUT."ingress_uuid"
				RETURNING "id", "api_uuid" "topic_id", "ingress_id", "media_type", "body", "original_body", "headers", "utc_created_at"
			`)
			.executeSingle(
				executionContext,
					/* 1 */messageApiId.uuid,
					/* 2 */JSON.stringify(headers),
					/* 3 */mimeType,
					/* 4 */body,
					/* 5 */_.isEqual(originalBody, body) ? null : originalBody,
					/* 6 */ingressApiId.uuid,
			);

		const messageDbId: string = messageResultRecord.get("id").asString; // BIGINT as string

		await this.sqlConnection
			.statement(`
				INSERT INTO "tb_egress_message_queue" ("message_id", "topic_id", "egress_id")
				SELECT M."id", M."topic_id", ET."egress_id"
				FROM "tb_message" AS M
				INNER JOIN "tb_egress_topic" AS ET ON ET."topic_id" = M."topic_id"
				WHERE M."id" = $1
			`)
			.execute(executionContext, messageDbId);

		// const message: Message = PostgresDatabase._mapMessageDbRow(messageResultRecord);
	}

	public async createTopic(
		executionContext: FExecutionContext,
		topicData: Partial<Topic.Id> & Topic.Data
	): Promise<Topic> {
		this.verifyInitializedAndNotDisposed();

		const topicId: TopicApiIdentifier = topicData.topicId ?? new TopicApiIdentifier();

		const sqlRecord: FSqlResultRecord = await this.sqlConnection
			.statement(`
					INSERT INTO "tb_topic"("api_uuid", "domain", "name", "description", "media_type")
					VALUES ($1, $2, $3, $4, $5)
					RETURNING "api_uuid", "domain", "name", "description", "media_type", "utc_created_date", "utc_deleted_date"
				`)
			.executeSingle(
				executionContext,
				/* 1 */topicId.uuid,
				/* 2 */topicData.topicDomain,
				/* 3 */topicData.topicName,
				/* 4 */topicData.topicDescription,
				/* 5 */topicData.topicMediaType,
			);

		const topicModel: Topic = PostgresDatabase._mapTopicDbRow(sqlRecord);
		return topicModel;
	}

	public async findEgress(executionContext: FExecutionContext, opts: Egress.Id): Promise<Egress | null> {
		this.verifyInitializedAndNotDisposed();

		const conditionStatements: Array<string> = [
			`E."utc_deleted_date" IS NULL`
		];
		const conditionParams: Array<FSqlStatementParam> = [];

		// by "api_uuid"
		conditionParams.push(opts.egressId.uuid)
		conditionStatements.push(`E."api_uuid" = $${conditionParams.length}`);

		const egressMainRecord: FSqlResultRecord | null = await this.sqlConnection
			.statement(`
				SELECT
					E."id",
					E."kind",
					E."api_uuid",
					E."utc_created_date",
					E."utc_deleted_date",
					(
						SELECT json_agg("api_uuid")
						FROM "tb_egress_topic" AS ET
						INNER JOIN "tb_topic" AS T ON T."id" = ET."topic_id"
						WHERE ET."egress_id" = E."id"
					)::JSONB AS "topic_uuids"
				FROM "tb_egress" AS E
				WHERE ${conditionStatements.map((condition) => `(${condition})`).join(" AND ")}
			`)
			.executeSingleOrNull(
				executionContext,
				...conditionParams,
			);

		// (
		// SELECT array_agg("id") FROM "tb_egress_topic"
		// ) AS "topic_uuids"

		if (egressMainRecord === null) {
			return null;
		}

		const egressDbId: number = egressMainRecord.get("id").asNumber; // INT
		const egressKind: string = egressMainRecord.get("kind").asString;
		ensureEgressKind(egressKind);

		let egressExtRecord: FSqlResultRecord;
		switch (egressKind) {
			case Egress.Kind.Telegram:
				throw new FExceptionInvalidOperation(`Not supported egress kind: ${egressKind}`);
			case Egress.Kind.Webhook:
				egressExtRecord = await this.sqlConnection
					.statement(`
						SELECT
							"id",
							"kind",
							"http_url" AS "webhook_http_url",
							"http_method" AS "webhook_http_method"
						FROM "tb_egress_webhook"
						WHERE "id" = $1
					`)
					.executeSingle(
						executionContext,
						/* 1 */egressDbId,
					);
				break;
			case Egress.Kind.WebSocketHost:
				egressExtRecord = await this.sqlConnection
					.statement(`
						SELECT "id", "kind"
						FROM "tb_egress_websockethost"
						WHERE "id" = $1
					`)
					.executeSingle(
						executionContext,
						/* 1 */egressDbId,
					);
				break;
			default:
				throw new FExceptionInvalidOperation(`Not supported egress kind: ${egressKind}`);
		}

		// const egressTopicRecords: ReadonlyArray<FSqlResultRecord> = await this.sqlConnection
		// 	.statement(`
		// 		SELECT T."api_uuid"
		// 		FROM "tb_egress_topic" AS ET
		// 		INNER JOIN "tb_topic" AS T ON T."id" = ET."topic_id"
		// 		WHERE "egress_id" = $1
		// 	`)
		// 	.executeQuery(
		// 		executionContext,
		// 		/* 1 */egressDbId
		// 	);

		const egressModel: Egress = PostgresDatabase._mapEgressDbRow(egressMainRecord, egressExtRecord);
		return egressModel;
	}

	public async findIngress(executionContext: FExecutionContext, opts: Ingress.Id): Promise<Ingress | null> {
		this.verifyInitializedAndNotDisposed();

		const conditionStatements: Array<string> = [
			`I."utc_deleted_date" IS NULL`
		];
		const conditionParams: Array<FSqlStatementParam> = [];

		// by "api_uuid"
		conditionParams.push(opts.ingressId.uuid)
		conditionStatements.push(`I."api_uuid" = $${conditionParams.length}`);

		const sqlMainRecord: FSqlResultRecord | null = await this.sqlConnection
			.statement(`
				SELECT I."id", I."kind", I."api_uuid", T."api_uuid" AS "topic_uuid", I."utc_created_date", I."utc_deleted_date"
				FROM "tb_ingress" AS I
				INNER JOIN "tb_topic" AS T ON T."id" = I."topic_id"
				WHERE ${conditionStatements.map((condition) => `(${condition})`).join(" AND ")}
			`)
			.executeSingleOrNull(
				executionContext,
				...conditionParams,
			);

		if (sqlMainRecord === null) {
			return null;
		}

		const ingressDbId: number = sqlMainRecord.get("id").asNumber;
		const topicUuid: string = sqlMainRecord.get("topic_uuid").asString;
		const ingressKind: string = sqlMainRecord.get("kind").asString;
		ensureIngressKind(ingressKind);

		let sqlExtendedRecord: FSqlResultRecord;
		switch (ingressKind) {
			case Ingress.Kind.HttpHost:
				sqlExtendedRecord = await this.sqlConnection
					.statement(`
						SELECT "id", "kind", "path", "response_status_code", "response_status_message", "response_headers", "response_body"
						FROM "tb_ingress_httphost"
						WHERE "id" = $1
					`)
					.executeSingle(
						executionContext,
						/* 1 */ingressDbId,
					);
				break;
			default:
				throw new FExceptionInvalidOperation(`Not supported ingress kind: ${ingressKind}`);
		}

		const ingressModel: Ingress = PostgresDatabase._mapIngressDbRow(sqlMainRecord, sqlExtendedRecord, topicUuid);
		return ingressModel;
	}

	public async findTopic(executionContext: FExecutionContext, opts: Topic.Id | Topic.Name | Ingress.Id): Promise<Topic | null> {
		this.verifyInitializedAndNotDisposed();

		const conditionStatements: Array<string> = [
			`"utc_deleted_date" IS NULL`
		];
		const conditionParams: Array<FSqlStatementParam> = [];

		if ("topicId" in opts) {
			// by "api_uuid"
			conditionParams.push(opts.topicId.uuid)
			conditionStatements.push(`"api_uuid" = $${conditionParams.length}`);
		} else if ("ingressId" in opts) {
			// by "ingressId"
			conditionParams.push(opts.ingressId.uuid)
			conditionStatements.push(`"id" = (SELECT "topic_id" FROM "tb_ingress" WHERE "api_uuid" = $${conditionParams.length})`);
		} else {
			// by "name"
			conditionParams.push(opts.topicName)
			conditionStatements.push(`"name" = $${conditionParams.length}`);

			// by "domain"
			if (opts.topicDomain !== null) {
				conditionParams.push(opts.topicDomain)
				conditionStatements.push(`"domain" = $${conditionParams.length}`);
			} else {
				conditionStatements.push(`"domain" IS NULL`);
			}
		}

		const sqlRecord: FSqlResultRecord | null = await this.sqlConnection
			.statement(`
					SELECT "api_uuid", "domain", "name", "description", "media_type", "utc_created_date", "utc_deleted_date"
					FROM "tb_topic"
					WHERE ${conditionStatements.map((condition) => `(${condition})`).join(" AND ")}
				`)
			.executeSingleOrNull(
				executionContext,
				...conditionParams,
			);

		if (sqlRecord === null) {
			return null;
		}

		const topicModel: Topic = PostgresDatabase._mapTopicDbRow(sqlRecord);
		return topicModel;
	}

	public async getEgress(executionContext: FExecutionContext, opts: Egress.Id): Promise<Egress> {
		const egressModel: Egress | null = await this.findEgress(executionContext, opts);

		if (egressModel === null) {
			throw new FExceptionInvalidOperation(`Trying to get non-existing egress.`);
		}

		return egressModel;
	}

	public async lockEgressMessageQueue(
		executionContext: FExecutionContext,
		opts: Topic.Id & Egress.Id & Message.Id
	): Promise<void> {
		this.verifyInitializedAndNotDisposed();

		await this.sqlConnection
			.statement(`
						SELECT 1
						FROM "tb_egress_message_queue" AS EMQ
						INNER JOIN "tb_topic" AS T ON T."id" = EMQ."topic_id"
						INNER JOIN "tb_egress" AS E ON E."id" = EMQ."egress_id"
						INNER JOIN "tb_message" AS M ON M."id" = EMQ."message_id"
						WHERE T."api_uuid" = $1 AND E."api_uuid" = $2 AND M."api_uuid" = $3
						FOR UPDATE
					`)
			.executeSingle(
				executionContext,
				/* 1 */opts.topicId.uuid,
				/* 1 */opts.egressId.uuid,
				/* 1 */opts.messageId.uuid,
			);
	}

	public async removeEgressMessageQueue(
		executionContext: FExecutionContext,
		opts: Topic.Id & Egress.Id & Message.Id
	): Promise<void> {
		this.verifyInitializedAndNotDisposed();

		await this.sqlConnection
			.statement(`
						DELETE
						FROM "tb_egress_message_queue"
						WHERE "topic_id" = (SELECT "id" FROM "tb_topic" WHERE "api_uuid" = $1)
							AND "egress_id" = (SELECT "id" FROM "tb_egress" WHERE "api_uuid" = $2)
							AND "message_id" = (SELECT "id" FROM "tb_message" WHERE "api_uuid" = $3)
					`)
			.execute(
				executionContext,
				/* 1 */opts.topicId.uuid,
				/* 1 */opts.egressId.uuid,
				/* 1 */opts.messageId.uuid,
			);
	}

	public async getIngress(executionContext: FExecutionContext, opts: Ingress.Id): Promise<Ingress> {
		const ingressModel: Ingress | null = await this.findIngress(executionContext, opts);

		if (ingressModel === null) {
			throw new FExceptionInvalidOperation(`Trying to get non-existing ingress.`);
		}

		return ingressModel;
	}

	public async getTopic(executionContext: FExecutionContext, opts: Topic.Id | Topic.Name | Ingress.Id): Promise<Topic> {
		const topicModel: Topic | null = await this.findTopic(executionContext, opts);

		if (topicModel === null) {
			throw new FExceptionInvalidOperation(`Trying to get non-existing topic.`);
		}

		return topicModel;
	}

	public async listEgresses(
		executionContext: FExecutionContext,
	): Promise<Array<Egress>> {
		this.verifyInitializedAndNotDisposed();

		const conditionStatements: Array<string> = [
			`E."utc_deleted_date" IS NULL`
		];
		const conditionParams: Array<FSqlStatementParam> = [];

		const sqlRecords: ReadonlyArray<FSqlResultRecord> = await this.sqlConnection
			.statement(`
				SELECT
					E."id",
					E."kind",
					E."api_uuid",
					E."utc_created_date",
					E."utc_deleted_date",
					(
						SELECT json_agg("api_uuid")
						FROM "tb_egress_topic" AS ET
						INNER JOIN "tb_topic" AS T ON T."id" = ET."topic_id"
						WHERE ET."egress_id" = E."id"
					)::JSONB AS "topic_uuids",
					EW."http_url" AS "webhook_http_url",
					EW."http_method" AS "webhook_http_method"
				FROM "tb_egress" AS E
				LEFT JOIN "tb_egress_webhook" AS EW ON EW."id" = E."id"
				LEFT JOIN "tb_egress_websockethost" AS EWH ON EWH."id" = E."id"
				WHERE ${conditionStatements.map((condition) => `(${condition})`).join(" AND ")}
			`)
			.executeQuery(
				executionContext,
				...conditionParams,
			);

		const egressModels: Array<Egress> = sqlRecords.map((sqlRecord) => {
			return PostgresDatabase._mapEgressDbRow(sqlRecord, sqlRecord);
		});
		return egressModels;
	}

	public async listEgressMessageQueue(
		executionContext: FExecutionContext,
		opts: Topic.Id | Egress.Id | Message.Id,
	): Promise<Array<Database.EgressMessageQueue>> {
		//
		throw new FExceptionInvalidOperation("Not implemented yet");
	}

	public async listTopics(
		executionContext: FExecutionContext,
	): Promise<Array<Topic>> {
		this.verifyInitializedAndNotDisposed();

		const conditionStatements: Array<string> = [
			`"utc_deleted_date" IS NULL`
		];
		const conditionParams: Array<FSqlStatementParam> = [];

		const sqlRecords: ReadonlyArray<FSqlResultRecord> = await this.sqlConnection
			.statement(`
					SELECT "api_uuid", "domain", "name", "description", "media_type", "utc_created_date", "utc_deleted_date"
					FROM "tb_topic"
					WHERE ${conditionStatements.map((condition) => `(${condition})`).join(" AND ")}
				`)
			.executeQuery(
				executionContext,
				...conditionParams,
			);

		const topicModels: Array<Topic> = sqlRecords.map(PostgresDatabase._mapTopicDbRow);
		return topicModels;
	}

	// public async removeSubscriber(
	// 	executionContext: FExecutionContext,
	// 	egressId: EgressApiIdentifier
	// ): Promise<void> {
	// 	this.verifyInitializedAndNotDisposed();

	// 	try {
	// 		await this._sqlProviderFactory.usingProvider(cancellationToken,
	// 			async (sqlProvider: SqlProvider) => sqlToolsSubscriber
	// 				.setDeleteDate(cancellationToken, sqlProvider, egressId)
	// 		);
	// 	} catch (e) {
	// 		throw storageHandledException(e);
	// 	}
	// }


	// public async deleteTopic(
	// 	executionContext: FExecutionContext,
	// 	topicData: Topic.Name & TopicSecurity
	// ): Promise<void> {
	// 	this._log.debug(`Run deleteTopic with topicData: ${topicData}`);
	// 	this.verifyInitializedAndNotDisposed();
	// 	try {

	// 		await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
	// 			return await topicFunctions.updateDeleteDate(cancellationToken, sqlProvider, topicData.topicName);
	// 		});
	// 		return;

	// 	} catch (e) {
	// 		this._log.error(`deleteTopic Error: ${e.message}`);
	// 		throw storageHandledException(e);
	// 	}
	// }

	// public async addSubscriberWebhook(
	// 	executionContext: FExecutionContext,
	// 	topicName: Topic.Name["topicName"],
	// 	webhookData: Webhook.Data
	// ): Promise<Webhook> {

	// 	this._log.debug(`Run addSubscriberWebhook with topicName: ${topicName} and webhookData ${webhookData}`);
	// 	this.verifyInitializedAndNotDisposed();

	// 	try {

	// 		const webhook: Webhook
	// 			= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
	// 				return await webhookFunctions.save(cancellationToken, sqlProvider, topicName, webhookData);
	// 			});

	// 		return webhook;

	// 	} catch (e) {
	// 		this._log.error(`addSubscriberWebhook Error: ${e.message}`);
	// 		throw storageHandledException(e);
	// 	}
	// }

	// public getSubscriberWebhook(
	// 	executionContext: FExecutionContext,
	// 	webhook: Webhook.Id["webhookId"]
	// ): Promise<Webhook> {
	// 	this._log.debug(`Run getSubscriberWebhook with webhook: ${webhook}`);
	// 	this.verifyInitializedAndNotDisposed();
	// 	throw new Error("Method not implemented.");
	// }

	// public async getTopicByWebhookId(executionContext: FExecutionContext, webhookId: Webhook.Id["webhookId"]): Promise<Topic> {
	// 	this._log.debug(`Run getTopicByWebhookId with webhookId: ${webhookId}`);
	// 	this.verifyInitializedAndNotDisposed();

	// 	try {
	// 		const topic: Topic
	// 			= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
	// 				return await topicFunctions.getTopicByWebhookId(cancellationToken, sqlProvider, webhookId);
	// 			});

	// 		return topic;
	// 	} catch (e) {
	// 		this._log.error(`getTopicByWebhookId Error: ${e.message}`);
	// 		throw storageHandledException(e);
	// 	}
	// }

	// public async getTopicByName(executionContext: FExecutionContext, topicName: Topic.Name["topicName"]): Promise<Topic> {
	// 	this._log.debug(`Run getTopicByName with topicName: ${topicName}`);
	// 	this.verifyInitializedAndNotDisposed();

	// 	try {
	// 		const topic: Topic
	// 			= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
	// 				return await topicFunctions.getByName(cancellationToken, sqlProvider, topicName);
	// 			});

	// 		return topic;
	// 	} catch (e) {
	// 		this._log.error(`getTopicByName Error: ${e.message}`);
	// 		throw storageHandledException(e);
	// 	}
	// }

	// public async getAvailableWebhooks(executionContext: FExecutionContext, security: Security): Promise<Array<Webhook>> {
	// 	this._log.debug(`Run getAvailableWebhooks with security: ${security}`);
	// 	this.verifyInitializedAndNotDisposed();

	// 	try {
	// 		const webhooks: Array<Webhook>
	// 			= await this._sqlProviderFactory.usingProvider(cancellationToken, async (sqlProvider: SqlProvider) => {
	// 				return await webhookFunctions.getBySecurity(cancellationToken, sqlProvider, security);
	// 			});

	// 		return webhooks;
	// 	} catch (e) {
	// 		this._log.error(`getTopicByName Error: ${e.message}`);
	// 		throw storageHandledException(e);
	// 	}
	// }

	// public removeSubscriberWebhook(
	// 	executionContext: FExecutionContext, webhook: Webhook.Id["webhookId"]
	// ): Promise<void> {
	// 	throw new Error("");
	// }

	protected async onInit(): Promise<void> {
		await super.onInit();
	}

	protected async onDispose(): Promise<void> {
		await super.onDispose();
	}

	private static _mapEgressDbRow(
		egressMainRecord: FSqlResultRecord,
		egressExtRecord: FSqlResultRecord,
		egressTopics?: ReadonlyArray<TopicApiIdentifier>
	): Egress {
		const egressUuid: string = egressMainRecord.get("api_uuid").asString;
		const egressKind: string = egressMainRecord.get("kind").asString;
		const egressCreatedAt: Date = egressMainRecord.get("utc_created_date").asDate;
		const egressDeletedAt: Date | null = egressMainRecord.get("utc_deleted_date").asDateNullable;

		ensureEgressKind(egressKind);

		if (egressTopics === undefined) {
			try {
				const egressTopicUuids: Array<string> | null = egressMainRecord.get("topic_uuids").asObjectNullable;
				egressTopics = egressTopicUuids !== null
					? egressTopicUuids.map(TopicApiIdentifier.fromUuid)
					: [];
			} catch (e) {
				throw e;
			}
		}

		const egressBase: Egress.Id & Omit<Egress.DataBase, "egressKind"> & Egress.Instance = {
			egressId: EgressApiIdentifier.fromUuid(egressUuid),
			egressTopicIds: egressTopics,
			egressCreatedAt: egressCreatedAt,
			egressDeletedAt: egressDeletedAt,
		};

		switch (egressKind) {
			case Egress.Kind.Webhook:
				return Object.freeze<Egress>({
					...egressBase,
					egressKind,
					egressHttpUrl: new URL(egressExtRecord.get("webhook_http_url").asString),
					egressHttpMethod: egressExtRecord.get("webhook_http_method").asStringNullable,
				});
			case Egress.Kind.WebSocketHost:
				return Object.freeze<Egress>({
					...egressBase,
					egressKind,
				});
			default:
				throw new FExceptionInvalidOperation(`Unsupported ingress kind: '${egressKind}'`);
		}
	}

	private static _mapIngressDbRow(
		sqlMainRecord: FSqlResultRecord,
		sqlExtendedRecord: FSqlResultRecord,
		topicUuid: string
	): Ingress {
		const ingressUuid: string = sqlMainRecord.get("api_uuid").asString;
		const ingressTopicUuid: string = topicUuid;
		const ingressKind: string = sqlMainRecord.get("kind").asString;
		const ingressCreatedAt: Date = sqlMainRecord.get("utc_created_date").asDate;
		const ingressDeletedAt: Date | null = sqlMainRecord.get("utc_deleted_date").asDateNullable;

		ensureIngressKind(ingressKind);

		const ingressBase: Ingress.Id & Omit<Ingress.DataBase, "ingressKind"> & Ingress.Instance = {
			ingressId: IngressApiIdentifier.fromUuid(ingressUuid),
			ingressTopicId: TopicApiIdentifier.fromUuid(ingressTopicUuid),
			ingressCreatedAt,
			ingressDeletedAt,
		};

		switch (ingressKind) {
			case Ingress.Kind.HttpHost:
				return Object.freeze<Ingress>({
					...ingressBase,
					ingressKind,
					ingressHttpHostPath: sqlExtendedRecord.get("path").asString,
					ingressHttpHostResponseStatusCode: sqlExtendedRecord.get("response_status_code").asNumber,
					ingressHttpHostResponseStatusMessage: sqlExtendedRecord.get("response_status_message").asStringNullable,
					ingressHttpHostResponseHeaders: sqlExtendedRecord.get("response_headers").asObjectNullable,
					ingressHttpHostResponseBody: sqlExtendedRecord.get("response_body").asBinaryNullable,
				});
			default:
				throw new FExceptionInvalidOperation(`Unsupported ingress kind: '${ingressKind}'`);
		}
	}

	private static _mapTopicDbRow(
		sqlRow: FSqlResultRecord
	): Topic {
		const topicUuid: string = sqlRow.get("api_uuid").asString;
		const topicDomain: string | null = sqlRow.get("domain").asStringNullable;
		const topicName: string = sqlRow.get("name").asString;
		const topicDescription: string = sqlRow.get("description").asString;
		const topicMediaType: string = sqlRow.get("media_type").asString;
		const topicCreatedAt: Date = sqlRow.get("utc_created_date").asDate;
		const topicDeletedAt: Date | null = sqlRow.get("utc_deleted_date").asDateNullable;

		const topic: Topic = {
			topicId: TopicApiIdentifier.fromUuid(topicUuid),
			topicName,
			topicDomain,
			topicDescription,
			topicMediaType,
			topicCreatedAt,
			topicDeletedAt
		};

		return Object.freeze<Topic>(topic);
	}
}

import { FException, FExecutionContext, FInitableBase, FLogger } from "@freemework/common";

import * as crypto from "crypto";

// Models
import { Topic } from "../model/topic";
// import { Security } from "../model/security";
// import { Publisher } from "../model/publisher";
// import { Subscriber } from "../model/subscriber";

import { TOKEN_BYTES_LEN } from "../constants";
import { PersistentStorage } from "../data/persistent_storage";
import { apiHandledException, WrongArgumentApiError } from "./errors";
import { Security } from "../model/security";

/**
 * Management API allows to control user's delivery endpoints, like add/remove webhooks
 */
export class ManagementApi extends FInitableBase {
	private readonly _storage: PersistentStorage;
	private readonly _log: FLogger;

	constructor(storage: PersistentStorage, log: FLogger) {
		super();
		this._storage = storage;
		this._log = log;
	}

	public async createTopic(
		executionContext: FExecutionContext, topicData: Topic.Id & Topic.Data
	): Promise<Topic> {
		if (this._log.isDebugEnabled) { this._log.debug(executionContext, `Enter createTopic with topicData: ${JSON.stringify(topicData)}`); }

		try {
			const fullTopicData: Topic.Id & Topic.Data = {
				topicName: topicData.topicName,
				topicDomain: topicData.topicDomain,
				topicDescription: topicData.topicDescription,
				topicMediaType: topicData.topicMediaType
			};

			const topic: Topic = await this._storage.createTopic(
				executionContext,
				{
					kind: "TOKEN",
					token: crypto.randomBytes(TOKEN_BYTES_LEN).toString("hex")
				},
				fullTopicData
			);

			if (this._log.isDebugEnabled) { this._log.debug(executionContext, `Exit createTopic with topic: ${JSON.stringify(topic)}`); }
			return topic;
		} catch (e) {
			if (this._log.isErrorEnabled || this._log.isTraceEnabled) {
				const err: FException = FException.wrapIfNeeded(e);
				if (this._log.isErrorEnabled) { this._log.error(executionContext, `Failure createTopic: ${err.message}`); }
				this._log.trace(executionContext, "Failure createTopic", err);
			}
			throw apiHandledException(e);
		}
	}

	public async listTopics(
		executionContext: FExecutionContext, domain: string | null
	): Promise<Array<Topic>> {
		const topics: Array<Topic> = await this._storage.listTopics(
			executionContext, domain
		);

		return topics;
	}

	// public async destroyTopic(
	// 	executionContext: FExecutionContext, topicId: Topic.Id, security: Security
	// ): Promise<void> {
	// 	this._log.debug(`Run destroyTopic with topic: ${topicId}`);

	// 	try {
	// 		const topicRecord: Topic = await this._storage.getTopic(cancellationToken, topicId);

	// 		const topicSecurityKind = topicRecord.topicSecurity.kind;
	// 		const topicSecurityToken = topicRecord.topicSecurity.token;

	// 		if (security.kind !== topicSecurityKind || security.token !== topicSecurityToken) {
	// 			throw new WrongArgumentApiError(`Wrong topic Security Kind or topic Security Token`);
	// 		}

	// 		if (topicRecord.deleteAt) {
	// 			throw new WrongArgumentApiError(`Topic ${topicId.topicName} already deleted`);
	// 		}

	// 		await this._storage.removeTopic(cancellationToken, topicId);
	// 	} catch (e) {
	// 		this._log.error(`destroyTopic Error: ${e.message}`);
	// 		throw apiHandledException(e);
	// 	}
	// }

	protected async onInit() {
		// nop
	}
	protected async onDispose() {
		// nop
	}
}

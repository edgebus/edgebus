import { FExceptionInvalidOperation, FExecutionContext, FInitableBase, FLogger } from "@freemework/common";

// Models
import { Topic } from "../model/topic";
import { Egress } from "../model/egress";
import { Security } from "../model/security";

import { DatabaseFactory } from "../data/database_factory";

import { UnknownApiError, apiHandledException } from "./errors";

/**
 * Egress API allows subscribe/unsubscribe for events via webhooks and other egress's type
 */
export class EgressApi extends FInitableBase {
	private readonly _log: FLogger;
	private readonly _storage: DatabaseFactory;

	constructor(_storage: DatabaseFactory, log: FLogger) {
		super();
		this._storage = _storage;
		this._log = log;
	}

	public async list(
		executionContext: FExecutionContext,
		egressSecurity: Security
	): Promise<Array<Egress>> {
		this._log.debug(executionContext, `Run egressWebhook with egressSecurity: ${egressSecurity}`);

		// try {
		// 	const webhooks: Array<Egress> = await this._storage
		// 		.getAvailableWebhooks(cancellationToken, egressSecurity);

		// 	return webhooks;

		// } catch (e) {
		// 	this._log.error(`getAvailableWebhooks Error: ${e.message}`);
		// 	throw apiHandledException(e);
		// }

		throw new FExceptionInvalidOperation("Method does not have implementation yet");
	}

	/**
	 * Subscribe topic as Webhook
	 * @param cancellationToken Allows you to try to cancel execution
	 * @param topicId Describes message source topic (includes topic security)
	 * @param opts Webhook specific options
	 */
	public async subscribeWebhook(
		executionContext: FExecutionContext, topicId: Topic.Id,
		topicSubscriberSecurity: Security, webhookData: Egress.Webhook
	): Promise<Egress> {

		this._log.debug(executionContext, `Run egressWebhook with topic: ${topicId} and webhookData ${webhookData}`);
		throw new FExceptionInvalidOperation("Not implemented yet");
		// try {
		// 	const topicSubscriberSecurityRecord: Topic = await this._storage
		// 		.getTopicSubscriberSecurity(cancellationToken, topicSubscriberSecurity);

		// 	const egressSecurityKind = topicRecord.security.kind;
		// 	const egressSecurityToken = topicRecord.security.token;

		// 	if (topicSubscriberSecurity.kind !== egressSecurityKind
		// 		|| topicSubscriberSecurity.token !== egressSecurityToken) {
		// 		throw new UnknownApiError(`Wrong Egress Security Kind or Egress Security Token`);
		// 	}

		// 	const webhookId: Egress<Egress.Webhook> = await this._storage
		// 		.addSubscriberWebhook(cancellationToken, topicId.topicName, webhookData);

		// 	return webhookId;
		// } catch (e) {
		// 	this._log.error(`egressWebhook Error: ${e.message}`);
		// 	throw apiHandledException(e);
		// }
	}

	/**
	 * Unsubscribe previously subscribed Webhook
	 * @param cancellationToken Allows you to try to cancel execution
	 * @param webhook Webhook identifier and security
	 * @returns Deleted date
	 */
	public async unsubscribe(
		executionContext: FExecutionContext, egress: Egress.Id
	): Promise<Date> {
		throw new FExceptionInvalidOperation("Not implemented yet");
		//this._log.debug(`Run egressWebhook with webhook: ${webhook}`);

		// try {
		// 	//const topic: Topic = await this._storage.getTopicByWebhookId(cancellationToken, webhook.egressId);

		// } catch (e) {
		// 	this._log.error(`unsubscribeWebhook Error: ${e.message}`);
		// 	throw apiHandledException(e);
		// }
	}


	protected async onInit() {
		// nop
	}
	protected async onDispose() {
		// nop
	}
}

export namespace EgressApi {
	export type TopicMap = Map<Topic["topicName"], Topic>;
}

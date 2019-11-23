import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";

// Models
import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";
import { RecipientUser } from "../model/RecipientUser";

/**
 * Management API allows to control user's delivery endpoints, like add/remove webhooks
 */
export class ManagementApi extends Initable {
	private readonly _logger: Logger;

	constructor(log: Logger) {
		super();
		this._logger = log;
	}

	public async getAvailableTopics(
		cancellationToken: CancellationToken, recipientUserId: RecipientUser.Id
	): Promise<ManagementApi.TopicMap> {
		if (this._logger.isTraceEnabled) {
			this._logger.trace(`Enter: getAvailableTopics(recipientUserId="${recipientUserId}")`);
		}

		const hardCodedMap = new Map();

		const hardCodedTopic: Topic = {
			topicId: "orderStateChanged",
			topicDescription: "The topic produces events about order execution state"
		};

		hardCodedMap.set(hardCodedTopic.topicId, hardCodedTopic);

		return hardCodedMap;
	}

	public async subscribeWebhook(
		cancellationToken: CancellationToken, recipientUserId: RecipientUser.Id, opts: Webhook.Data
	): Promise<ManagementApi.TopicMap> {
		throw new InvalidOperationError("Method does not have implementation yet");
	}

	public async unsubscribeWebhook(
		cancellationToken: CancellationToken, recipientUserId: RecipientUser.Id, webhookId: Webhook.Id
	): Promise<ManagementApi.TopicMap> {
		throw new InvalidOperationError("Method does not have implementation yet");
	}


	protected async onInit() {
		// nop
	}
	protected async onDispose() {
		// nop
	}
}

export namespace ManagementApi {
	export type TopicMap = Map<Topic["topicId"], Topic>;
}

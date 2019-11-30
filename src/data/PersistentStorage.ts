import { CancellationToken } from "@zxteam/contract";
import { Disposable, Initable } from "@zxteam/contract";

import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";

export interface PersistentStorage extends Initable {
	getAvailableTopics(
		cancellationToken: CancellationToken
	): Promise<Topic[]>;

	addSubscriberWebhook(
		cancellationToken: CancellationToken,
		webhookData: Webhook.Data
	): Promise<Webhook.Id>;

	getSubscriberWebhook(webhook: Webhook.Id["webhookId"]): Promise<Webhook>;

	removeSubscriberWebhook(
		cancellationToken: CancellationToken,
		webhookId: Webhook.Id["webhookId"]
	): Promise<void>;
}

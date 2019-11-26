import { CancellationToken } from "@zxteam/contract";
import { Disposable, Initable } from "@zxteam/contract";

import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";
import { RecipientUser } from "../model/RecipientUser";


export interface PersistentStorage extends Initable {
	getAvailableTopics(
		cancellationToken: CancellationToken,
		recipientUserId: RecipientUser.Id
	): Promise<Topic[]>;

	addSubscribeWebhook(
		cancellationToken: CancellationToken,
		recipientUserId: RecipientUser.Id,
		opts: Webhook.Data
	): Promise<Webhook.Id>;

	removeSubscribeWebhook(
		cancellationToken: CancellationToken,
		recipientUserId: RecipientUser.Id,
		webhookId: Webhook.Id
	): Promise<void>;
}

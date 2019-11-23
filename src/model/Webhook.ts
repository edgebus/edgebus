import { Topic } from "./Topic";

export namespace Webhook {
	/**
	 * The ID of the Webhook
	 */
	export type Id = string;

	export interface Data {
		/**
		 * The hook URL
		 */
		readonly url: URL;

		/**
		 * Name of attached topic for the Webhook
		 */
		readonly topicId: Topic["topicId"];
	}
}

export interface Webhook extends Webhook.Data {
	readonly webhookId: Webhook.Id;
}

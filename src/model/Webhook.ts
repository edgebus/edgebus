import { Topic } from "./Topic";

export namespace Webhook {
	/**
	 * The ID of the Webhook
	 */
	export interface Id {
		readonly webhookId: string;
	}

	export interface Data {
		/**
		 * The hook URL
		 */
		readonly url: URL;

		/**
		 * Trusted ca certificate from client
		 */
		readonly trustedCaCertificate: string;

		/**
		 * Header Token from client
		 */
		readonly headerToken: string;
	}

	export interface Instance {
		/**
		 * ID of attached topic for the Webhook
		 */
		readonly topicName: Topic.Name["topicName"];
	}
}

export type Webhook = Webhook.Id & Webhook.Data & Webhook.Instance;

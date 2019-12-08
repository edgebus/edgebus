import { Topic } from "./Topic";

export namespace Webhook {
	export interface Id {
		/**
 		* The ID of the Webhook
 		*/
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

	export interface Timestamps {
		readonly createAt: Date;
		readonly deleteAt: Date | null;
	}
}

export type Webhook = Webhook.Id & Webhook.Data & Webhook.Instance & Webhook.Timestamps;

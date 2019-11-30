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
	}

	export interface Instance {
		/**
		 * ID of attached topic for the Webhook
		 */
		readonly topicId: Topic["topicId"];
	}

	export interface Security {
		readonly securityKind: "TOKEN";
		readonly securityToken: string;
	}
}

export type Webhook = Webhook.Id & Webhook.Data & Webhook.Instance & Webhook.Security;

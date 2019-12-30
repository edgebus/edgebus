import { SubscriberSecurity } from "./SubscriberSecurity";
import { Topic } from "./Topic";

export namespace Subscriber {
	export const enum Kind {
		Webhook = "Webhook",
		WebSocketHost = "WebSocketHost"
	}

	/**
	 * The ID of the Subscriber
	 */
	export interface Id {
		readonly subscriberId: string;
	}

	export interface Instance {
		readonly kind: Kind;

		/**
		 * Name of the attached topic
		 */
		readonly topicName: Topic.Name["topicName"];

		readonly createAt: Date;
	}

	export interface Webhook {
		readonly kind: Kind.Webhook;

		/**
		 * The hook URL
		 */
		readonly url: URL;

		/**
		 * Trusted ca certificate from client
		 */
		readonly trustedCaCertificate: string | null;

		/**
		 * Header Token from client
		 */
		readonly headerToken: string;
	}
	export interface WebSocketHost {
		readonly kind: Kind.Webhook;

		/**
		 * Trusted ca certificate from client
		 */
		readonly trustedCaCertificate: string | null;
	}
}

export type Subscriber<TImpl extends Subscriber.Webhook | Subscriber.WebSocketHost = (Subscriber.Webhook | Subscriber.WebSocketHost)>
	= Subscriber.Id & Subscriber.Instance & SubscriberSecurity & TImpl;

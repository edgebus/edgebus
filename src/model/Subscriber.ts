import { Security } from "./Security";
import { Topic } from "./Topic";
import { Converter } from "./Convert";

export namespace Subscriber {
	export const enum Kind {
		Telegram = "Telegram",
		Webhook = "Webhook",
		WebSocketHost = "WebSocketHost"
	}

	/**
	 * The ID of the Subscriber
	 */
	export interface Id {
		readonly subscriberId: string;
	}

	export interface Data {
		/**
		 * Name of the attached topic
		 */
		readonly topicId: Topic.Id;

		readonly kind: Kind;
		readonly converters: ReadonlyArray<Converter>;
	}

	export interface Telegram extends Data {
		readonly kind: Kind.Telegram;
		readonly todo: string | null;
	}
	export interface Webhook extends Data {
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
	export interface WebSocketHost extends Data {
		readonly kind: Kind.Webhook;

		/**
		 * Trusted ca certificate from client
		 */
		readonly trustedCaCertificate: string | null;
	}

	export type DataVariant = Telegram | Webhook | WebSocketHost;

	export interface Instance extends Id, Data {
		readonly createAt: Date;
		readonly deleteAt: Date | null;
	}
}

export type Subscriber<TVariant extends Subscriber.DataVariant = Subscriber.DataVariant>
	= Subscriber.Instance & TVariant;

import { PublisherSecurity } from "./PublisherSecurity";
import { Topic } from "./Topic";
import { DestroySecurity } from "./DestroySecurity";
import { Converter } from "./Convert";

export namespace Publisher {
	export const enum Kind {
		/**
		 * Allows to publish messages via HTTP request
		 */
		Http = "HTTP",

		/**
		 * Allows to publish messages via WebSocket. `Notifier` will connect to your WebSocket server to get messages.
		 */
		WebSocketClient = "WEB_SOCKET_CLIENT",


		/**
		 * Allows to publish messages via WebSocket. `Notifier` will listen for client's connections.
		 */
		WebSocketHost = "WEB_SOCKET_HOST"
	}


	/**
	 * The ID of the Webhook
	 */
	export interface Id {
		readonly publisherId: string;
	}

	export interface Instance {
		readonly kind: Kind;

		/**
		 * Name of the attached topic
		 */
		readonly topicName: Topic.Name["topicName"];

		readonly createAt: Date;
	}

	export interface Base extends DestroySecurity {
		readonly converts: ReadonlyArray<Converter>;
	}

	export interface Http extends Base {
		readonly kind: Kind.Http;

		/**
		 * The publisher will trust for clients that provide SSL certificate issued by this authorities
		 */
		readonly clientSslTrustedCaCertificates: string | null;

		/**
		 * The publisher will trust for clients that provide SSL certificate with this common name
		 */
		readonly clientSslCommonName: string | null;

		/**
		 * The publisher will trust for clients that provide all of these headers
		 */
		readonly mandatoryHeaders: { readonly [name: string]: string };
	}

	export interface WebSocketHost extends Base {
		readonly kind: Kind.WebSocketHost;

		// TBD
	}

	export interface WebSocketClient extends Base {
		readonly kind: Kind.WebSocketClient;

		// TBD
	}

	export interface Timestamps {
		readonly createAt: Date;
		readonly deleteAt: Date | null;
	}
}

interface SslModel {
	readonly clientTrustedCA: string;
	readonly clientCommonName: string;
}

export type Publisher<
	TImpl extends Publisher.Http | Publisher.WebSocketClient | Publisher.WebSocketHost =
	(Publisher.Http | Publisher.WebSocketClient | Publisher.WebSocketHost)
	>
	= Publisher.Id & Publisher.Instance & PublisherSecurity & TImpl;

import { Topic } from "./topic";
import { Converter } from "./convert";
import { Security } from "./security";

export namespace Publisher {
	export const enum Kind {
		/**
		 * Allows to publish messages via HTTP request
		 */
		Http = "HTTP",

		/**
		 * Allows to publish messages via WebSocket. `EdgeBus` will connect to your WebSocket server to get messages.
		 */
		WebSocketClient = "WEB_SOCKET_CLIENT",


		/**
		 * Allows to publish messages via WebSocket. `EdgeBus` will listen for client's connections.
		 */
		WebSocketHost = "WEB_SOCKET_HOST"
	}

	/**
	 * The ID of the Webhook
	 */
	export interface Id {
		readonly publisherId: string;
	}

	export interface Data {
		/**
		 * Name of the attached topic
		 */
		readonly topicId: Topic.Id;

		readonly kind: Kind;
		readonly converters: ReadonlyArray<Converter>;
	}

	export interface Http extends Data {
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

	export interface WebSocketHost extends Data {
		readonly kind: Kind.WebSocketHost;

		// TBD
	}

	export interface WebSocketClient extends Data {
		readonly kind: Kind.WebSocketClient;

		// TBD
	}

	export type DataVariant = Http | WebSocketClient | WebSocketHost;

	export interface Instance extends Id, Data {
		readonly createAt: Date;
		readonly deleteAt: Date | null;
	}
}

// interface SslModel {
// 	readonly clientTrustedCA: string;
// 	readonly clientCommonName: string;
// }

export type Publisher<TVariant extends Publisher.DataVariant = Publisher.DataVariant>
	= Publisher.Instance & TVariant;

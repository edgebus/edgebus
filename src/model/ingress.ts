import { FException } from "@freemework/common";
import { IngressApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";

export namespace Ingress {
	export const enum Kind {
		/**
		 * Allows to ingress messages via HTTP request
		 */
		HttpHost = "HTTP_HOST",

		/**
		 * Allows to ingress messages via WebSocket. `EdgeBus` will connect to your WebSocket server to get messages.
		 */
		WebSocketClient = "WEB_SOCKET_CLIENT",


		/**
		 * Allows to ingress messages via WebSocket. `EdgeBus` will listen for client's connections.
		 */
		WebSocketHost = "WEB_SOCKET_HOST"
	}

	/**
	 * The ID of the Webhook
	 */
	export interface Id {
		readonly ingressId: IngressApiIdentifier;
	}

	export interface DataBase {
		/**
		 * Name of the attached topic
		 */
		readonly ingressTopicId: TopicApiIdentifier;

		/**
		 * Kind of ingress
		 */
		readonly ingressKind: Kind;

		// readonly ingressConverters: ReadonlyArray<Converter>;
	}

	export interface HttpHost extends DataBase {
		readonly ingressKind: Kind.HttpHost;

		readonly ingressHttpHostPath: string;
		readonly ingressHttpHostResponseStatusCode: number;
		readonly ingressHttpHostResponseStatusMessage: string | null;
		readonly ingressHttpHostResponseHeaders: Readonly<Record<string, string | null>> | null;
		readonly ingressHttpHostResponseBody: Uint8Array | null;

		// /**
		//  * The ingress will trust for clients that provide SSL certificate issued by this authorities
		//  */
		// readonly ingressHttpHostClientSslTrustedCaCertificates: string | null;

		// /**
		//  * The ingress will trust for clients that provide SSL certificate with this common name
		//  */
		// readonly ingressHttpHostClientSslCommonName: string | null;

		// /**
		//  * The ingress will trust for clients that provide all of these headers
		//  */
		// readonly ingressHttpHostMandatoryHeaders: Readonly<Record<string, string | null>> | null;
	}

	export interface WebSocketHost extends DataBase {
		readonly ingressKind: Kind.WebSocketHost;

		// TBD
		readonly a: string;
	}

	export interface WebSocketClient extends DataBase {
		readonly ingressKind: Kind.WebSocketClient;

		// TBD
	}

	export type Data = HttpHost | WebSocketClient | WebSocketHost;

	export interface Instance {
		readonly ingressCreatedAt: Date;
		readonly ingressDeletedAt: Date | null;
	}
}

// interface SslModel {
// 	readonly clientTrustedCA: string;
// 	readonly clientCommonName: string;
// }

export type Ingress
	= Ingress.Id
	& Ingress.Data
	& Ingress.Instance
	;

export function ensureIngressKind(kind: string): asserts kind is Ingress.Kind {
	const friendlyKind: Ingress.Kind = kind as Ingress.Kind;
	switch (friendlyKind) {
		case Ingress.Kind.HttpHost:
		case Ingress.Kind.WebSocketClient:
		case Ingress.Kind.WebSocketHost:
			return;
		default:
			throw new EnsureIngressKindNeverException(friendlyKind);
	}
}
class EnsureIngressKindNeverException extends FException {
	public constructor(kind: never) {
		super(`Wrong ingress kind value '${kind}'`);
	}
}
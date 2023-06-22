import { FException } from "@freemework/common";

import { EgressIdentifier, LabelIdentifier, TopicIdentifier } from "./identifiers";

export namespace Egress {
	export const enum Kind {
		Telegram = "TELEGRAM",

		/**
		 * Egress messages via HTTP request (WebHooks)
		 */
		Webhook = "WEBHOOK",

		/**
		 * Egress messages via WebSocket. `EdgeBus` will listen for client's connections.
		 */
		WebSocketHost = "WEB_SOCKET_HOST"
	}

	/**
	 * The API Identifier of the Egress
	 */
	export interface Id {
		readonly egressId: EgressIdentifier;
	}

	export interface DataBase {
		/**
		 * Name of the attached topic
		 */
		// TODO: Change type to ReadonlyArray<Topic.Id & Topic.Name> 
		readonly egressTopicIds: ReadonlyArray<TopicIdentifier>;

		readonly egressKind: Kind;

		readonly egressLabelIds: ReadonlyArray<LabelIdentifier>;
		// readonly egressConverters: ReadonlyArray<Converter>;
	}

	export interface Telegram extends DataBase {
		readonly egressKind: Kind.Telegram;
		// readonly todo: string | null;
	}
	export interface Webhook extends DataBase {
		readonly egressKind: Kind.Webhook;

		/**
		 * The hook URL
		 */
		readonly egressHttpUrl: URL;

		/**
		 * An override HTTP method.
		 * If `null` egress will try to use "http.method" from message headers and fallback to 'POST'
		 */
		readonly egressHttpMethod: string | null;

		// /**
		//  * Trusted ca certificate from client
		//  */
		// readonly egressTrustedCaCertificate: string | null;

		// /**
		//  * Header Token from client
		//  */
		// readonly egressHeaderToken: string;
	}
	export interface WebSocketHost extends DataBase {
		readonly egressKind: Kind.WebSocketHost;

		// /**
		//  * Trusted ca certificate from client
		//  */
		// readonly egressTrustedCaCertificate: string | null;
	}

	export type Data= Telegram | Webhook | WebSocketHost;

	export interface Instance {
		readonly egressCreatedAt: Date;
		readonly egressDeletedAt: Date | null;
	}
}

export type Egress
	= Egress.Id
	& Egress.Data
	& Egress.Instance
	;


export function ensureEgressKind(kind: string): asserts kind is Egress.Kind {
	const friendlyKind: Egress.Kind = kind as Egress.Kind;
	switch (friendlyKind) {
		case Egress.Kind.Telegram:
		case Egress.Kind.Webhook:
		case Egress.Kind.WebSocketHost:
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

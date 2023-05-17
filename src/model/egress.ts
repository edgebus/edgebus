import { FException } from "@freemework/common";

import { Security } from "./security";
import { Topic } from "./topic";
import { Converter } from "./convert";
import { EgressApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";

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
		readonly egressId: EgressApiIdentifier;
	}

	export interface DataBase {
		/**
		 * Name of the attached topic
		 */
		readonly egressTopicIds: ReadonlyArray<TopicApiIdentifier>;

		readonly egressKind: Kind;
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

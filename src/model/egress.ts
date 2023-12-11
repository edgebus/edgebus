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

	export const enum FilterLabelPolicy {
		/**
		 * Deliver a message if ALL message labels presented in Egress labels list
		 */
		STRICT = "strict",

		/**
		 * Deliver a message if ANY message label presented in Egress labels list
		 */
		LAX = "lax",

		/**
		 * Skip a message if any labels presented
		 */
		SKIP = "skip",

		/**
		 * Deliver a message always (ignore label filter at all)
		 */
		IGNORE = "ignore"
	}

	/**
	 * The API Identifier of the Egress
	 */
	export interface Id {
		readonly egressId: EgressIdentifier;
	}

	export interface DataCommon {
		/**
		 * Attached topic ids
		 */
		readonly egressTopicIds: ReadonlyArray<TopicIdentifier>;

		/**
		 * Kind of Egress
		 */
		readonly egressKind: Kind;

		/**
		 * Filter policy
		 */
		readonly egressFilterLabelPolicy: FilterLabelPolicy;

		/**
		 * Set of label identifiers for filter
		 */
		readonly egressFilterLabelIds: ReadonlyArray<LabelIdentifier>;

		// readonly egressConverters: ReadonlyArray<Converter>;
	}

	export interface Telegram extends DataCommon {
		readonly egressKind: Kind.Telegram;
		// readonly todo: string | null;
	}
	export interface Webhook extends DataCommon {
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
	export interface WebSocketHost extends DataCommon {
		readonly egressKind: Kind.WebSocketHost;

		// /**
		//  * Trusted ca certificate from client
		//  */
		// readonly egressTrustedCaCertificate: string | null;
	}

	export type Data = Telegram | Webhook | WebSocketHost;

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


export function ensureEgressKind(kindLike: string): asserts kindLike is Egress.Kind {
	const friendlyKind: Egress.Kind = kindLike as Egress.Kind;
	switch (friendlyKind) {
		case Egress.Kind.Telegram:
		case Egress.Kind.Webhook:
		case Egress.Kind.WebSocketHost:
			return;
		default:
			throw new UnsupportedEgressKindNeverException(friendlyKind);
	}
}
class UnsupportedEgressKindNeverException extends FException {
	public constructor(kind: never) {
		super(`Wrong ingress kind value '${kind}'`);
	}
}

export function ensureEgressFilterLabelPolicy(filterLabelPolicyLike: string): asserts filterLabelPolicyLike is Egress.FilterLabelPolicy {
	const friendlyKind: Egress.FilterLabelPolicy = filterLabelPolicyLike as Egress.FilterLabelPolicy;
	switch (friendlyKind) {
		case Egress.FilterLabelPolicy.IGNORE:
		case Egress.FilterLabelPolicy.LAX:
		case Egress.FilterLabelPolicy.SKIP:
		case Egress.FilterLabelPolicy.STRICT:
			return;
		default:
			throw new UnsupportedEgressFilterLabelPolicyNeverException(friendlyKind);
	}
}
export class UnsupportedEgressFilterLabelPolicyNeverException extends FException {
	public constructor(kind: never) {
		super(`Wrong ingress kind value '${kind}'`);
	}
}

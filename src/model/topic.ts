import { FException } from "@freemework/common";
import { TopicIdentifier } from "./identifiers";

export namespace Topic {

	export const enum Kind {
		Asynchronous = "ASYNCHRONOUS",
		Synchronous = "SYNCHRONOUS",
	}
	export interface Id {
		readonly topicId: TopicIdentifier;
	}
	export interface Name {
		/**
		 * Human readable name defines a `Topic`'s purpose
		 */
		readonly topicName: string;

		/**
		 * Used for domain owned topics
		 */
		readonly topicDomain: string | null;
	}
	export interface Data extends Name {
		/**
		 * Human readable (long) description defines a `Topic`'s purpose
		 */
		readonly topicDescription: string;

		/**
		 * Message media type
		 * https://en.wikipedia.org/wiki/Media_type
		 */
		readonly topicMediaType: string;

		/**
		 * Asynchronous Messages - manage, audit, transform, guarantee delivery
		 * Synchronous Calls - audit, transform, retry
		 */
		readonly topicKind: Topic.Kind;
	}

	export interface Instance extends Id, Data {
		readonly topicCreatedAt: Date;
		readonly topicDeletedAt: Date | null;
	}
}

export type Topic = Topic.Instance;

export function ensureTopicKind(kindLike: string): asserts kindLike is Topic.Kind {
	const friendlyKind: Topic.Kind = kindLike as Topic.Kind;
	switch (friendlyKind) {
		case Topic.Kind.Asynchronous:
		case Topic.Kind.Synchronous:
			return;
		default:
			throw new UnsupportedETopicKindNeverException(friendlyKind);
	}
}

class UnsupportedETopicKindNeverException extends FException {
	public constructor(kind: never) {
		super(`Wrong topic kind value '${kind}'`);
	}
}

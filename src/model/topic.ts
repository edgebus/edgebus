import { TopicApiIdentifier } from "../misc/api-identifier";

export namespace Topic {

	export interface Id {
		readonly topicId: TopicApiIdentifier;
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
	}

	export interface Instance extends Id, Data {
		readonly topicCreatedAt: Date;
		readonly topicDeletedAt: Date | null;
	}
}

export type Topic = Topic.Instance;

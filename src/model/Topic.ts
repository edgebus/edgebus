import { PublisherSecurity } from "./PublisherSecurity";
import { SubscriberSecurity } from "./SubscriberSecurity";
import { TopicSecurity } from "./TopicSecurity";

export namespace Topic {

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
	export interface Description {
		/**
		 * Human readable (long) description defines a `Topic`'s purpose
		 */
		readonly topicDescription: string;
	}
	export interface MediaType {
		/**
		 * Message media type
		 * https://en.wikipedia.org/wiki/Media_type
		 */
		readonly mediaType: string;
	}

	export interface Timestamps {
		readonly createAt: Date;
		readonly deleteAt: Date | null;
	}


	export type Data = Name & Description & MediaType;
}

export type Topic = Topic.Data & TopicSecurity & PublisherSecurity & SubscriberSecurity & Topic.Timestamps;

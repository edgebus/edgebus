import { Security as SecurityModel } from "./Security";
import { Publisher } from "./Publisher";
import { Subscriber } from "./Subscriber";

export namespace Topic {

	export interface Name {
		/**
 		* Human readable name defines a `Topic`'s purpose
 		*/
		readonly topicName: string;
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

	export interface Security {
		readonly topicSecurity: SecurityModel;
	}

	export type Data = Name & Description & MediaType;
}

export type Topic = Topic.Data & Topic.Security & Publisher.Security & Subscriber.Security & Topic.Timestamps;

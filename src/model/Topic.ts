import { Security as SecurityModel } from "./Security";
import { Publisher } from "./Publisher";
import { Subscriber } from "./Subscriber";

export namespace Topic {
	/**
	 * The ID of the `Topic`
	 */
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

	export interface Security {
		readonly topicSecurity: SecurityModel;
	}

	export type Data = Name & Description & MediaType;
}

export type Topic = Topic.Name & Topic.Data & Topic.Security & Publisher.Security & Subscriber.Security;

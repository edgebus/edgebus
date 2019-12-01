export namespace Topic {
	/**
	 * The ID of the `Topic`
	 */
	export interface Id {
		readonly topicId: string;
	}

	export interface Data {
		/**
 		* Human readable name defines a `Topic`'s purpose
 		*/
		readonly name: string;
		/**
		 * Human readable (long) description defines a `Topic`'s purpose
		 */
		readonly description: string;
	}

	export interface TopicSecurity {
		readonly topicSecurityKind: "TOKEN";
		readonly topicSecurityToken: string;
	}

	export interface PublisherSecurity {
		readonly publisherSecurityKind: "TOKEN";
		readonly publisherSecurityToken: string;
	}

	export interface SubscriberSecurity {
		readonly subscriberSecurityKind: "TOKEN";
		readonly subscriberSecurityToken: string;
	}
}

export type Topic = Topic.Id & Topic.Data & Topic.TopicSecurity & Topic.PublisherSecurity & Topic.SubscriberSecurity;

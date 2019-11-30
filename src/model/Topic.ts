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

	export interface Security {
		readonly securityKind: "TOKEN";
		readonly securityToken: string;
	}
}

export type Topic = Topic.Id & Topic.Data & Topic.Security;

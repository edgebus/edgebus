export namespace Topic {
	/**
	 * The ID of the `Topic`
	 */
	export type Id = string;

	export interface Data {
		/**
 		* Human readable name defines a `Topic`'s purpose
 		*/
		readonly topicName: string;
		/**
		 * Human readable description defines a `Topic`'s purpose
		 */
		readonly topicDescription: string;
	}
}

export interface Topic extends Topic.Data {
	readonly topicId: Topic.Id;
}

export namespace RecipientUser {
	/**
	 * The ID of the `RecipientUser`
	 */
	export type Id = string;

	export interface Data {
		// TBD
	}
}

export interface RecipientUser extends RecipientUser.Data {
	readonly recipientUserId: RecipientUser.Id;
}

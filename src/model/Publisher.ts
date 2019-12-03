import { Security as SecurityModel } from "./Security";

export namespace Publisher {
	/**
	 * The ID of the Webhook
	 */
	export interface Id {
		readonly publisherId: string;
	}

	export interface Data {
		//
	}

	export interface Security {
		/**
		 * ID of attached topic for the Webhook
		 */
		readonly publisherSecurity: SecurityModel;
	}
}

export type Publisher = Publisher.Id & Publisher.Data & Publisher.Security;

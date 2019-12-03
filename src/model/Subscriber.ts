import { Security as SecurityModel } from "./Security";

export namespace Subscriber {
	/**
	 * The ID of the Webhook
	 */
	export interface Id {
		readonly subscriberId: string;
	}

	export interface Data {
		//
	}

	export interface Security {
		/**
		 * ID of attached topic for the Webhook
		 */
		readonly subscriberSecurity: SecurityModel;
	}
}

export type Subscriber = Subscriber.Id & Subscriber.Data & Subscriber.Security;

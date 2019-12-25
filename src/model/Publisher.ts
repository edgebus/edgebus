import { Security as SecurityModel } from "./Security";

export namespace Publisher {
	/**
	 * The ID of the Webhook
	 */
	export interface Id {
		readonly publisherId: string;
	}

	export interface Data {
		readonly sslOption: SslModel;
	}

	export interface Security {
		/**
		 * ID of attached topic for the Webhook
		 */
		readonly publisherSecurity: SecurityModel;
	}

	export interface Timestamps {
		readonly createAt: Date;
		readonly deleteAt: Date | null;
	}
}

interface SslModel {
	readonly clientTrustedCA: string;
	readonly clientCommonName: string;
}

export type Publisher = Publisher.Id & Publisher.Data & Publisher.Timestamps & Publisher.Security;

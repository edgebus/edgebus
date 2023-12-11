import { FConfiguration, FException, FExceptionInvalidOperation } from "@freemework/common";

export class DatabaseMigrationSettings {
	private constructor(
		/**
		 * Connection URL to persistent storage (for example PostgreSQL)
		 */
		public readonly databaseURL: URL,
	) { }

	public static parse(configuration: FConfiguration): DatabaseMigrationSettings {
		const edgebusConfiguration: FConfiguration = configuration.getNamespace("edgebus");

		const edgebusInitializeConfiguration: FConfiguration = edgebusConfiguration.getNamespace("initialize");

		const databaseURL: URL = edgebusInitializeConfiguration.get("database.url").asUrl;

		const appSettings: DatabaseMigrationSettings = new DatabaseMigrationSettings(
			databaseURL,
		);

		return appSettings;
	}
}

export namespace DatabaseMigrationSettings {
	//
}

export class DatabaseMigrationSettingsException extends FException { }

//
//  ___           _                                   _
// |_ _|  _ __   | |_    ___   _ __   _ __     __ _  | |
//  | |  | '_ \  | __|  / _ \ | '__| | '_ \   / _` | | |
//  | |  | | | | | |_  |  __/ | |    | | | | | (_| | | |
// |___| |_| |_|  \__|  \___| |_|    |_| |_|  \__,_| |_|
//

//

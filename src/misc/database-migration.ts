// import { FCancellationExecutionContext, FCancellationToken, FCancellationTokenSource, FCancellationTokenSourceManual, FException, FExecutionContext, FLogger, Fsleep } from "@freemework/common";

// import { DatabaseMigrationSettings } from "./database-migration-settings";
// import { FLauncherRuntime } from "@freemework/hosting/lib/launcher/launcher";

// export default async function (
// 	executionContext: FExecutionContext,
// 	settings: DatabaseMigrationSettings
// ): Promise<FLauncherRuntime> {
// 	const log: FLogger = FLogger.create("EdgeBus.DatabaseMigration");

// 	const appCancellationTokenSource: FCancellationTokenSource = new FCancellationTokenSourceManual();
// 	executionContext = new FCancellationExecutionContext(executionContext, appCancellationTokenSource.token, true);

// 	log.info(executionContext, "Initializing DI runtime...");


// 	(async function () {
// 		try {
// 			await migrate(settings.databaseURL);
// 			await Fsleep(executionContext, 3000);
// 		} catch (e) {
// 			const err = FException.wrapIfNeeded(e);
// 			log.debug(executionContext, err.message, err);
// 			log.error(executionContext, err.message);
// 		}
// 	})();

// 	return {
// 		async destroy() {
// 			log.info(executionContext, "Destroying DI runtime...");

// 			appCancellationTokenSource.cancel();

// 			// for (const hardcodedItem of itemsToDispose.reverse()) {
// 			// 	await hardcodedItem.dispose();
// 			// }

// 			// await FDisposable.disposeAll(
// 			// 	// Endpoints should dispose first (reply 503, while finishing all active requests)
// 			// 	ProviderLocator.default.get(EndpointsProvider),
// 			// 	ProviderLocator.default.get(HostingProvider),
// 			// 	ProviderLocator.default.get(MessageBusProvider),
// 			// 	ProviderLocator.default.get(StorageProvider)
// 			// );
// 		}
// 	};
// }

// async function migrate(databaseURL: URL) {
// 	//
// }



// // "use strict";

// // Object.defineProperty(exports, "__esModule", { value: true });

// // const { chainConfiguration, envConfiguration, fileConfiguration, secretsDirectoryConfiguration } = require("@zxteam/configuration");
// // const { DUMMY_CANCELLATION_TOKEN } = require("@zxteam/cancellation");
// // const { safeDispose } = require("@zxteam/disposable");
// // const { wrapErrorIfNeeded } = require("@zxteam/errors");
// // const { logger } = require("@zxteam/logger");
// // const { PostgresMigrationManager, PostgresProviderFactory } = require("@zxteam/sql-postgres");

// // const fs = require("fs");
// // const path = require("path");

// // const packageJson = require("../package.json");
// // const { name: packageName, version: packageVersion } = packageJson;

// // const log = logger.getLogger(path.basename(__filename));

// // async function main() {
// // 	const configParts = [];

// // 	configParts.push(envConfiguration());

// // 	const configArg = process.argv.find(arg => arg.startsWith("--config="));
// // 	if (configArg !== undefined) {
// // 		const configFile = configArg.substring(9); // cut "--config="
// // 		configParts.push(await fileConfiguration(configFile));
// // 	}

// // 	if (fs.existsSync("/run/secrets")) {
// // 		configParts.push(await secretsDirectoryConfiguration("/run/secrets"));
// // 	}

// // 	const config = chainConfiguration(...configParts);

// // 	log.info(`Migration Database for package: ${packageName}@${packageVersion}`);

// // 	const persistentStorageMigrationConfig = config.getConfiguration("persistentStorageMigration");
// // 	const persistentStorageUrl = persistentStorageMigrationConfig.getURL("url");

// // 	let sqlProviderFactory;
// // 	switch (persistentStorageUrl.protocol) {
// // 		case "postgres:": {
// // 			sqlProviderFactory = createPostgresSqlProviderFactory(persistentStorageMigrationConfig, log);
// // 			await sqlProviderFactory.init(DUMMY_CANCELLATION_TOKEN);
// // 			break;
// // 		}
// // 		default: {
// // 			throw new WrongConfigurationError(`Unsupported kind of the PersistentStorage. URL Schema '${persistentStorageUrl.protocol}' is not supported yet.`);
// // 		}
// // 	}

// // 	const maskedUrl = new URL(persistentStorageUrl.toString());
// // 	maskedUrl.password = "*****";
// // 	log.info(`Target URL: ${maskedUrl.toString()}`);

// // 	try {
// // 		const migrationFilesRootPath = path.normalize(path.join(__dirname, "..", "database"));

// // 		const migrationManager = new PostgresMigrationManager({ sqlProviderFactory, migrationFilesRootPath, log, versionTableName: "__db_version" });
// // 		await migrationManager.init(DUMMY_CANCELLATION_TOKEN);
// // 		try {
// // 			await migrationManager.migrate(DUMMY_CANCELLATION_TOKEN);
// // 		} finally {
// // 			await safeDispose(migrationManager);
// // 		}
// // 	} finally {
// // 		await safeDispose(sqlProviderFactory);
// // 	}
// // 	log.info(`Migration Database complete successfully.`);
// // }

// // class WrongConfigurationError extends Error { }

// // // function createPostgresSqlProviderFactory(postgresConfig, log) {
// // // 	let hasSSL = false;
// // // 	const ssl = {};
// // // 	if (postgresConfig.hasNonEmpty("ssl.caCert")) {
// // // 		const caFileOrBase64 = postgresConfig.getString("ssl.caCert");
// // // 		if (fs.existsSync(caFileOrBase64)) {
// // // 			ssl.caCert = fs.readFileSync(caFileOrBase64);
// // // 		} else {
// // // 			ssl.caCert = Buffer.from(postgresConfig.getBase64("ssl.caCert"));
// // // 		}
// // // 		hasSSL = true;
// // // 	}

// // // 	if (postgresConfig.hasNonEmpty("ssl.cert") || postgresConfig.hasNonEmpty("ssl.key")) {
// // // 		ssl.clientCert = {};

// // // 		const certFileOrBase64 = postgresConfig.getString("ssl.cert");  // cert is mandatory in this case
// // // 		if (fs.existsSync(certFileOrBase64)) {
// // // 			ssl.clientCert.cert = fs.readFileSync(certFileOrBase64);
// // // 		} else {
// // // 			ssl.clientCert.cert = Buffer.from(postgresConfig.getBase64("ssl.cert"));
// // // 		}

// // // 		const keyFileOrBase64 = postgresConfig.getString("ssl.key");  // key is mandatory in this case
// // // 		if (fs.existsSync(keyFileOrBase64)) {
// // // 			ssl.clientCert.key = fs.readFileSync(keyFileOrBase64);
// // // 		} else {
// // // 			ssl.clientCert.key = Buffer.from(postgresConfig.getBase64("ssl.key"));
// // // 		}

// // // 		hasSSL = true;
// // // 	}

// // // 	const applicationName = `${packageName}@${packageVersion}`;
// // // 	if (!hasSSL) {
// // // 		log.info("--------------------------------------------------");
// // // 		log.info("WARNING: Using unsecured connection to Postgres...");
// // // 		log.info("--------------------------------------------------");
// // // 		return new PostgresProviderFactory({
// // // 			url: postgresConfig.getURL("url"),
// // // 			applicationName
// // // 		});
// // // 	} else {
// // // 		return new PostgresProviderFactory({
// // // 			url: postgresConfig.getURL("url"),
// // // 			applicationName,
// // // 			ssl
// // // 		});
// // // 	}
// // // }

// // // main().catch((e) => {
// // // 	if (e instanceof WrongConfigurationError) {
// // // 		log.error(e.message);
// // // 	} else {
// // // 		const err = wrapErrorIfNeeded(e);
// // // 		log.error(err.message);
// // // 		log.trace(err.message, err);
// // // 	}
// // // 	process.exit(1);
// // // });

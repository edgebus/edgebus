import { CancellationToken } from "@zxteam/contract";
import { Container, Runtime as LauncherRuntime } from "@zxteam/launcher";
import { logger } from "@zxteam/logger";

import * as _ from "lodash";

import { RuntimeProvider } from "./provider/RuntimeProvider";
import { Configuration } from "./Configuration";
import { ConfigurationProvider, ConfigurationProviderImpl } from "./provider/ConfigurationProvider";

const { name: serviceName, version: serviceVersion } = require("../package.json");

export default async function (cancellationToken: CancellationToken, config: Configuration): Promise<LauncherRuntime> {
	const log = logger.getLogger("RuntimeFactory");

	log.info(`Package: ${serviceName}@${serviceVersion}`);

	// Register DI providers
	Container.bind(ConfigurationProvider).provider({ get() { return new ConfigurationProviderImpl(config); } });

	log.info("Compose applicaton DI container...");
	const diRuntime: RuntimeProvider = Container.get(RuntimeProvider);

	log.info("Initializing DI runtime...");
	await diRuntime.init(cancellationToken);

	return {
		async destroy() {
			log.info("Destroying DI runtime...");
			await diRuntime.dispose();
		}
	};
}

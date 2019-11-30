import { CancellationToken } from "@zxteam/contract";
import { Initable, Disposable } from "@zxteam/disposable";
import { Container, Runtime as LauncherRuntime } from "@zxteam/launcher";
import { logger } from "@zxteam/logger";

import * as _ from "lodash";

import { Configuration } from "./Configuration";

import { ConfigurationProvider, ConfigurationProviderImpl } from "./provider/ConfigurationProvider";
import { StorageProvider } from "./provider/StorageProvider";
import { EndpointsProvider } from "./provider/EndpointsProvider";
import { HostingProvider } from "./provider/HostingProvider";
import { MessageBusProvider } from "./provider/MessageBusProvider";

const { name: serviceName, version: serviceVersion } = require("../package.json");

export default async function (cancellationToken: CancellationToken, config: Configuration): Promise<LauncherRuntime> {
	const log = logger.getLogger("RuntimeFactory");

	log.info(`Package: ${serviceName}@${serviceVersion}`);

	// Register DI providers
	Container.bind(ConfigurationProvider).provider({ get() { return new ConfigurationProviderImpl(config); } });

	log.info("Initializing DI runtime...");
	await Initable.initAll(cancellationToken,
		Container.get(StorageProvider),
		Container.get(MessageBusProvider),
		Container.get(EndpointsProvider),
		Container.get(HostingProvider)
	);

	return {
		async destroy() {
			log.info("Destroying DI runtime...");
			await Disposable.disposeAll(
				// Endpoints should dispose first (reply 503, while finishing all active requests)
				Container.get(EndpointsProvider),
				Container.get(HostingProvider),
				Container.get(MessageBusProvider),
				Container.get(StorageProvider)
			);
		}
	};
}

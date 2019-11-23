import { Configuration as RawConfiguration } from "@zxteam/contract";
import { launcher, LaunchError } from "@zxteam/launcher";
import { envConfiguration, chainConfiguration, fileConfiguration, secretsDirectoryConfiguration } from "@zxteam/configuration";

import { configurationFactory, Configuration } from "./Configuration";
import runtimeFactory from "./index";
import * as fs from "fs";
import * as util from "util";

const exists = util.promisify(fs.exists);

async function appConfigurationFactory(): Promise<Configuration> {
	const configFileArg = process.argv.find(w => w.startsWith("--config="));
	if (configFileArg === undefined) {
		throw new LaunchError("An argument --config is not passed");
	}

	const chainItems: Array<RawConfiguration> = [];

	const envConf = envConfiguration();
	chainItems.push(envConf);

	const isSecretsPresents = await exists("/run/secrets");
	if (isSecretsPresents) {
		const swarmConf = await secretsDirectoryConfiguration("/run/secrets");
		chainItems.push(swarmConf);
	}

	const configFile = configFileArg.substring(9); // Cut --config=
	const fileConf = fileConfiguration(configFile);
	chainItems.push(fileConf);

	const appConfiguration = configurationFactory(
		chainConfiguration(...chainItems)
	);
	return appConfiguration;
}

launcher(appConfigurationFactory, runtimeFactory);



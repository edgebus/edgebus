#!/usr/bin/env node

"use strict";

const { FLogger, FLoggerConsole, FLoggerLevel } = require("@freemework/common");
const { Flauncher } = require("@freemework/hosting");

const fs = require("fs");
const { Container } = require("typescript-ioc");

const loggerLevel = FLoggerLevel.parse((process.env.LOG_LEVEL ?? "info").toUpperCase());
FLogger.setLoggerFactory((loggerName)=> FLoggerConsole.create(loggerName, loggerLevel));

const { default: runtimeFactory, Settings } = require("..");


// Contract providers
const { BuildInfoProvider } = require("../src/provider/build_info_provider");


// Devel implementation providers
const { DevelBuildInfoProvider } = require("../src-devel/provider/devel_build_info");


const logoFile = __filename.replace(/.js$/, ".logo");
if (fs.existsSync(logoFile)) {
	console.log(fs.readFileSync().toString());
}


// Make Devel environment
Container.bind(BuildInfoProvider).provider({ get() { return new DevelBuildInfoProvider(); } });


// Launch app
Flauncher(Settings.parse, runtimeFactory);

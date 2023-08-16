#!/usr/bin/env node

"use strict";

const { FLogger, FLoggerLevel } = require("@freemework/common");
const { FLauncher } = require("@freemework/hosting");

const fs = require("fs");
const { Container } = require("typescript-ioc");

const { default: runtimeFactory, Settings, LoggerConsole } = require("..");

{
	const loggerLevel = FLoggerLevel.parse((process.env.LOG_LEVEL ?? "info").toUpperCase());
	const loggerFormat = (process.env.LOG_FORMAT ?? "text").toLowerCase() === "json" ? "json" : "text"
	FLogger.setLoggerFactory((loggerName) => LoggerConsole.create(loggerName, { level: loggerLevel, format: loggerFormat }));
}

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
FLauncher(Settings.parse, runtimeFactory);

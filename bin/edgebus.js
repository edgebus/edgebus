#!/usr/bin/env node

"use strict";

const { FLogger, FLoggerLevel } = require("@freemework/common");
const { FLauncher } = require("@freemework/hosting");

const { default: runtimeFactory, Settings, LoggerConsole, RestartRequireException } = require("..");

{
	const loggerLevel = FLoggerLevel.parse((process.env.LOG_LEVEL ?? "info").toUpperCase());
	const loggerFormat = (process.env.LOG_FORMAT ?? "text").toLowerCase() === "json" ? "json" : "text"
	FLogger.setLoggerFactory((loggerName) => LoggerConsole.create(loggerName, { level: loggerLevel, format: loggerFormat }));
}

FLauncher(Settings.parse, runtimeFactory);

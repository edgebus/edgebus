#!/usr/bin/env node

"use strict";

const { FLogger, FLoggerLevel } = require("@freemework/common");
const { Flauncher } = require("@freemework/hosting");

const { default: runtimeFactory, Settings, LoggerConsole } = require("..");

{
	const loggerLevel = FLoggerLevel.parse((process.env.LOG_LEVEL ?? "info").toUpperCase());
	const loggerFormat = (process.env.LOG_FORMAT ?? "text").toLowerCase() === "json" ? "json" : "text"
	FLogger.setLoggerFactory((loggerName) => LoggerConsole.create(loggerName, { level: loggerLevel, format: loggerFormat }));
}

Flauncher(Settings.parse, runtimeFactory);

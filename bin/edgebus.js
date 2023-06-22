#!/usr/bin/env node

"use strict";

const { FLogger, FLoggerConsole, FLoggerLevel } = require("@freemework/common");
const { Flauncher } = require("@freemework/hosting");

const loggerLevel = FLoggerLevel.parse((process.env.LOG_LEVEL ?? "info").toUpperCase());
FLogger.setLoggerFactory((loggerName)=> FLoggerConsole.create(loggerName, loggerLevel));

const { default: runtimeFactory, Settings } = require("..");

Flauncher(Settings.parse, runtimeFactory);

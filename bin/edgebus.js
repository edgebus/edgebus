#!/usr/bin/env node

"use strict";

const { Flauncher } = require("@freemework/hosting");

const { default: runtimeFactory, Configuration } = require("..");

Flauncher(Configuration.parse, runtimeFactory);

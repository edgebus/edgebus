#!/usr/bin/env node

"use strict";

const { Flauncher } = require("@freemework/hosting");

const { default: runtimeFactory, Configuration } = require("../src");

Flauncher(Configuration.parse, runtimeFactory);

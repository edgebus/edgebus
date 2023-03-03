#!/usr/bin/env node

"use strict";

const { Flauncher } = require("@freemework/hosting");

const { default: runtimeFactory, Settings } = require("..");

Flauncher(Settings.parse, runtimeFactory);

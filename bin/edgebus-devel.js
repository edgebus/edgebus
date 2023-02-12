#!/usr/bin/env node

"use strict";

const fs = require("fs");
const { Container } = require("typescript-ioc");
const { Flauncher } = require("@freemework/hosting");

const { default: runtimeFactory, Configuration } = require("..");


// Contract providers
const { BuildInfo } = require("../src/provider/BuildInfo");


// Devel implementation providers
const { DevelBuildInfo } = require("../src-devel/provider/DevelBuildInfo");


const logoFile = __filename.replace(/.js$/, ".logo");
if (fs.existsSync(logoFile)) {
	console.log(fs.readFileSync().toString());
}


// Make Devel environment
Container.bind(BuildInfo).provider({ get() { return new DevelBuildInfo(); } });


// Launch app
Flauncher(Configuration.parse, runtimeFactory);

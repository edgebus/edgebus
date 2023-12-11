#!/usr/bin/env node

"use strict";

const { Flauncher } = require("@freemework/hosting");

const { databaseMigration, DatabaseMigrationSettings } = require("..");

Flauncher(DatabaseMigrationSettings.parse, databaseMigration);

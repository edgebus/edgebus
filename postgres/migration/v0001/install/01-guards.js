const EXPECTED_PREVIOUS_VERSION = "v0000"; // change by you own

async function migration(cancellationToken, sqlConnection, logger) {
	{ // Database name guard
		const dbName = (await sqlConnection.statement("SELECT current_database()").executeScalar()).asString;
		if (dbName !== "{{database.name}}") {
			throw new Error(`Wrong database! Current database '${dbName}' is not equals to expected database '{{database.name}}'`);
		}
	}

	{ // Migration user guard
		const dbUser = (await sqlConnection.statement("SELECT current_user").executeScalar()).asString;
		if (dbUser !== "{{database.user.owner}}") {
			throw new Error(`Wrong database user! Current database user '${dbUser}' is not equals to expected user '{{database.user.owner}}'`);
		}
	}

	{ // Version guard
		const versionNumbers = await sqlConnection
			.statement('SELECT COUNT(*)::INT FROM "public"."__migration"')
			.executeScalar(cancellationToken);

		if (versionNumbers.asNumber !== 0) {
			throw new Error(`Wrong database! Some migrations found. Expected a database without migrations. Cannot continue.`);
		}
	}
}

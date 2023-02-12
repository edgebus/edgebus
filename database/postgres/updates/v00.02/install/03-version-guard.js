const EXPECTED_PREVIOUS_VERSION = "v00.01"; // change by you own

async function migration(cancellationToken, sqlProvider, log) {
	const versionRow = await sqlProvider
		.statement('SELECT "version", "utc_deployed_at" FROM "public"."__migration" ORDER BY "version" DESC LIMIT 1')
		.executeSingleOrNull(cancellationToken);

	if (versionRow === null) {
		throw new Error(`Wrong database! No any migrations found. Expected previous version: "${EXPECTED_PREVIOUS_VERSION}". Cannot continue.`);
	}

	const version = versionRow.get("version").asString;
	const deployedAt = versionRow.get("utc_deployed_at").asDate;

	if (version !== EXPECTED_PREVIOUS_VERSION) {
		throw new Error(`Wrong database! Database version is "${version}" (deployed at ${deployedAt.toISOString()}). Expected version: "${EXPECTED_PREVIOUS_VERSION}". Cannot continue.`);
	}
}

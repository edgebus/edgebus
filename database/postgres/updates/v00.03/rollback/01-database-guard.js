async function migration(cancellationToken, sqlProvider, log) {
	const dbName = (await sqlProvider.statement("SELECT current_database()").executeScalar()).asString;
	if (dbName !== "{{database.name}}") {
		throw new Error(`Wrong database! Current database '${dbName}' is not equals to expected database '{{database.name}}'`);
	}
}

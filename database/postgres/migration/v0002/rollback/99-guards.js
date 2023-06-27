async function migration(cancellationToken, sqlConnection, log) {
	const dbName = (await sqlConnection.statement("SELECT current_database()").executeScalar()).asString;
	if (dbName !== "{{database.name}}") {
		throw new Error(`Wrong database! Current database '${dbName}' is not equals to expected database '{{database.name}}'`);
	}

	const dbUser = (await sqlConnection.statement("SELECT current_user").executeScalar()).asString;
	if (dbUser !== "{{database.user.owner}}") {
		throw new Error(`Wrong database user! Current database user '${dbUser}' is not equals to expected user '{{database.user.owner}}'`);
	}
}

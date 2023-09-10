async function migration(cancellationToken, sqlConnection, log) {
	const dbName = (await sqlConnection.statement("SELECT current_database()").executeScalar()).asString;
	if (dbName !== "devdb") {
		throw new Error(`Wrong database! Current database '${dbName}' is not equals to expected database 'devdb'`);
	}

	const dbUser = (await sqlConnection.statement("SELECT current_user").executeScalar()).asString;
	if (dbUser !== "postgres") {
		throw new Error(`Wrong database user! Current database user '${dbUser}' is not equals to expected user 'postgres'. This version of migration should be executed by super user (to be able to drop roles)`);
	}
}

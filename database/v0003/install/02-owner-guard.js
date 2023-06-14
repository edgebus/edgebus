async function migration(cancellationToken, sqlProvider, log) {
	const dbUser = (await sqlProvider.statement("SELECT current_user").executeScalar()).asString;
	if (dbUser !== "{{database.user.owner}}") {
		throw new Error(`Wrong database user! Current database user '${dbUser}' is not equals to expected user '{{database.user.owner}}'`);
	}
}

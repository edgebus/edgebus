async function migration(cancellationToken, sqlProvider, log) {
	log.info(`BEGIN INSTALL: ${__filename}. This version of migration should be executed by super user (to be able to create new roles)`);
}

#!/bin/sh
#

echo
echo "Enter to EdgeBus Entrypoint..."

case "${1}" in
	"/bin/sh"|"/bin/bash"|shell)
		exec /bin/sh
		;;
	"notifier+migration")
		echo
		echo "Database Migration pre-checks..."
		persistentStorageMigration_URL=$(awk 'BEGIN {print ENVIRON["persistentStorageMigration.url"]}')
		if [ -z "${persistentStorageMigration_URL}" -a ! -f "/run/secrets/persistentStorageMigration.url" ]; then
			echo "Nor 'persistentStorageMigration.url' environment variable nor file '/run/secrets/persistentStorageMigration.url' not found" >&2
			exit 1
		fi
		echo
		echo "Starting migrate-database script..."
		/usr/local/bin/node /usr/local/org.zxteam.notifier/bin/migrate-database.js
		echo
		echo "Starting EdgeBus..."
		exec /usr/local/bin/node /usr/local/org.zxteam.notifier/bin/notifier-service.js --config=/etc/org.zxteam.notifier/notifier-service.config
		;;
	"notifier")
		echo
		echo "Starting EdgeBus..."
		exec /usr/local/bin/node /usr/local/org.zxteam.notifier/bin/notifier-service.js --config=/etc/org.zxteam.notifier/notifier-service.config
		;;
	*)
		echo "Wrong CMD argument: ${1}" >&2
		echo
		echo "Available CMD:"
		echo "	notifier"
		echo "	notifier+migration"
		echo "	/bin/sh"
		echo "	/bin/bash"
		echo "	shell"
		echo
		exit 1
		;;
esac

#!/bin/sh
#

# allow the container to be started with `--user`
if [ "$(id -u)" = '0' ]; then
	echo "{ \"level\":\"info\", \"message\": \"Started as user 'root'.\" }"

	echo "{ \"level\":\"info\", \"message\": \"Restarting as user 'node'...\" }"
	exec su node "$0" -- "$@"
else
	echo "{ \"level\":\"info\", \"message\": \"Started as user '$(id -u -n)'.\" }"
fi

if [ -n "${DO_INIT_SLEEP}" ]; then
	DO_INIT_SLEEP=$(( ${DO_INIT_SLEEP} + 0 ))
	if [ ${DO_INIT_SLEEP} -gt 0 ]; then
		echo "{ \"level\":\"Information\", \"message\": \"Initial sleep ${DO_INIT_SLEEP} seconds...\" }"
		while [ ${DO_INIT_SLEEP} -gt 0 ]; do
			DO_INIT_SLEEP=$(( ${DO_INIT_SLEEP} - 1 ))
			sleep 1
		done
	fi
fi

# Start the service
cd /usr/local/edgebus
exec node "bin/edgebus.js" "$@"

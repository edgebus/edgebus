#!/bin/bash
#

SOURCE=${BASH_SOURCE[0]}
while [ -L "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
  SOURCE=$(readlink "$SOURCE")
  [[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )


DO_BUILD=yes
# parse args
while [ "$1" != "" ]; do
	case "$1" in
		--no-build)
			DO_BUILD=no
			;;
		*)
			echo "Unexpected parameter $1" >&2
			exit 1
			;;
	esac
	shift
done


if [ "${DO_BUILD}" == "yes" ]; then
	echo "Building migration sources..."
	${DIR}/migration-build.sh
	echo
fi

set -e

echo "Apply migrations..."
docker run --network=edgebus-local-tier \
  --rm --interactive --tty \
  --env "POSTGRES_URL=postgres://postgres@postgres:5432/devdb" \
  --env "TARGET_VERSION=v0000" \
  --env LOG_LEVEL=info \
  --volume "${DIR}/.dist:/var/local/sqlmigrationrunner-postgres/migration" \
  theanurin/sqlmigrationrunner-postgres:0.1.0 \
    install --no-sleep
docker run --network=edgebus-local-tier \
  --rm --interactive --tty \
  --env "POSTGRES_URL=postgres://edgebus-local-owner@postgres:5432/devdb" \
  --env "TARGET_VERSION=v9999" \
  --env LOG_LEVEL=info \
  --volume "${DIR}/.dist:/var/local/sqlmigrationrunner-postgres/migration" \
  theanurin/sqlmigrationrunner-postgres:0.1.0 \
    install --no-sleep

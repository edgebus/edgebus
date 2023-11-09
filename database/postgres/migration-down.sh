#!/bin/bash
#

SOURCE=${BASH_SOURCE[0]}
while [ -L "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )
  SOURCE=$(readlink "$SOURCE")
  [[ $SOURCE != /* ]] && SOURCE=$DIR/$SOURCE # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR=$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )


DO_BUILD=no
DO_IGNORE_ERROR=no
# parse args
while [ "$1" != "" ]; do
	case "$1" in
		--build)
			DO_BUILD=yes
			;;
		--ignore-errors)
			DO_IGNORE_ERROR=yes
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

if [ "${DO_IGNORE_ERROR}" != "yes" ]; then
	set -e
fi

echo "Apply migrations..."
docker run --network=edgebus-local-tier \
  --rm --interactive --tty \
  --env "POSTGRES_URL=postgres://edgebus-local-owner@postgres:5432/devdb" \
  --env "DB_TARGET_VERSION=v0000" \
  --env LOG_LEVEL=info \
  theanurin/sqlmigrationrunner:0.10.14 \
    rollback --no-sleep
docker run --network=edgebus-local-tier \
  --rm --interactive --tty \
  --env "POSTGRES_URL=postgres://postgres@postgres:5432/devdb" \
  --env LOG_LEVEL=info \
  theanurin/sqlmigrationrunner:0.10.14 \
    rollback --no-sleep

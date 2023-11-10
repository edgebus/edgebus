# Evaluate SQL dump

```shell
docker network create edgebus-local-tier
docker run --rm --detach --publish 52000:5432 \
  --network edgebus-local-tier --name edgebus-dump-pg \
  --mount  type=bind,source="${PWD}/dbseed/10-extensions.sql",target=/updates/10-extensions.sql \
  --mount  type=bind,source="${PWD}/dbseed/11-edgebus-users.sql",target=/updates/11-edgebus-users.sql \
  --mount  type=bind,source="${PWD}/dbseed/12-edgebus-database.sql",target=/updates/12-edgebus-database.sql \
  theanurin/devel.postgres-13
```

```shell
psql postgres://postgres@127.0.0.1:52000/devdb -c 'DROP TABLE "public"."emptytestflag"'


cd edgebus/src-typescript-service/database/postgres
ZONE=local ./migration-build.sh

docker run --network=edgebus-local-tier \
  --rm --interactive --tty \
  --env "POSTGRES_URL=postgres://edgebus-local-owner@edgebus-dump-pg:5432/edgebus-local" \
  --env "DB_TARGET_VERSION=v9999" \
  --env LOG_LEVEL=info \
  --volume "${PWD}/.dist:/data" \
  theanurin/sqlmigrationrunner:0.10.14 \
    install --no-sleep

cd edgebus/deployment-local
pg_dump postgres://postgres@127.0.0.1:52000/edgebus-local > dbseed/edgebus-local/edgebus-local-dump.sql

docker stop edgebus-dump-pg
docker network rm edgebus-local-tier
```

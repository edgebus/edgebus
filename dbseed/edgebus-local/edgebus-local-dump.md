# Evaluate SQL dump

```shell
docker network create edgebus-local-tier
docker run --rm --detach --publish 52000:5432 \
  --network edgebus-local-tier --name edgebus-dump-pg \
  --mount  type=bind,source="${PWD}/dbseed/10-init.sql",target=/updates/10-init.sql \
  --mount  type=bind,source="${PWD}/dbseed/11-edgebus-sandbox-init.sql",target=/updates/11-edgebus-local-init.sql \
  theanurin/devel.postgres-13
```

```shell
psql postgres://postgres@127.0.0.1:52000/devdb -c 'DROP TABLE "public"."emptytestflag"'


cd edgebus/src-typescript-service/database/postgres
ZONE=local ./migration-build.sh
rm .dist/v0000/install/10-add-users.sql

docker run --network=edgebus-local-tier \
  --rm --interactive --tty \
  --env "POSTGRES_URL=postgres://postgres@edgebus-dump-pg:5432/edgebus-local" \
  --env "TARGET_VERSION=v0000" \
  --env LOG_LEVEL=info \
  --volume "${PWD}/.dist:/var/local/sqlmigrationrunner-postgres/migration" \
  theanurin/sqlmigrationrunner-postgres:0.1.0 \
    install --no-sleep
docker run --network=edgebus-local-tier \
  --rm --interactive --tty \
  --env "POSTGRES_URL=postgres://edgebus-local-owner@edgebus-dump-pg:5432/edgebus-local" \
  --env "TARGET_VERSION=v9999" \
  --env LOG_LEVEL=info \
  --volume "${PWD}/.dist:/var/local/sqlmigrationrunner-postgres/migration" \
  theanurin/sqlmigrationrunner-postgres:0.1.0 \
    install --no-sleep


cd edgebus
pg_dump postgres://postgres@127.0.0.1:52000/edgebus-local > dbseed/11-edgebus-sandbox-init.sql

docker stop edgebus-dump-pg
docker network rm edgebus-local-tier
```

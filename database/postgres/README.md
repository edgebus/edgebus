# Database

## Quick Actions

- Build (this step will provide `./database/postgres/.dist` directory)
  ```shell
  docker run --interactive --tty --rm --volume "${PWD}/database/postgres":/data --env ENV=local --env "database.name=edgebus" --env "database.schema.runtime.name=public" --env "database.user.owner=edgebus-owner" --env "database.user.api=edgebus-user" zxteamorg/devel.migration-builder:20210623 --config-file=database.config --config-file=database-local.config --config-env
  ```
- Deploy
  ```shell
  export POSTGRES_URL=postgres://edgebus-owner@your.pg.server:5432/edgebus
  export TARGET_VERSION=v00.02
  docker run --rm --interactive --tty --env POSTGRES_URL --env TARGET_VERSION=v00.00 --volume "${PWD}/database/postgres/.dist:/var/local/cexiolabs/migration" --volume "${PWD}/log4js.json:/etc/cexiolabs/migration/log4js.json" cexiolabs/migration-postgres:20210623 install --no-sleep
  docker run --rm --interactive --tty --env POSTGRES_URL --env TARGET_VERSION --volume "${PWD}/database/postgres/.dist:/var/local/cexiolabs/migration" --volume "${PWD}/log4js.json:/etc/cexiolabs/migration/log4js.json" cexiolabs/migration-postgres:20210623 install --no-sleep
  ```
- Rollback
  ```shell
  export POSTGRES_URL=postgres://edgebus-owner@your.pg.server:5432/edgebus
  export TARGET_VERSION=v00.00
  docker run --rm --interactive --tty --env POSTGRES_URL --env TARGET_VERSION --volume "${PWD}/database/postgres/.dist:/var/local/cexiolabs/migration" --volume "${PWD}/log4js.json:/etc/cexiolabs/migration/log4js.json" cexiolabs/migration-postgres:20210623 rollback --no-sleep
  ```

```shell
docker network create edgebus-local-tier
docker run --rm --interactive --tty --network=edgebus-local-tier --name postgres zxteamorg/devel.postgres-13:20210703
docker run --rm --interactive --tty --network=edgebus-local-tier --name pgadmin --publish 5438:80 --env PGADMIN_DEFAULT_EMAIL=dev@edgebus.io --env PGADMIN_DEFAULT_PASSWORD=devel dpage/pgadmin4:6.20
```

Open pgAdmin on `http://127.0.0.1:5438`, login as `dev@edgebus.io/devel` and create server connection to `postgres://postgres@postgres:5432/devdb`.

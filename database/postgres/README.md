```shell
docker network create edgebus-local-tier
docker run --rm --interactive --tty --network=edgebus-local-tier --name postgres zxteamorg/devel.postgres-13:20210703
docker run --rm --interactive --tty --network=edgebus-local-tier --name pgadmin --publish 5438:80 --env PGADMIN_DEFAULT_EMAIL=dev@edgebus.io --env PGADMIN_DEFAULT_PASSWORD=devel dpage/pgadmin4:6.20
```

Open pgAdmin on `http://127.0.0.1:5438`, login as `dev@edgebus.io/devel` and create server connection to `postgres://postgres@postgres:5432/devdb`.

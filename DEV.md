# Start postgres10emptytestdb container
docker kill postgres10emptytestdb; docker rm postgres10emptytestdb; docker run --name postgres10emptytestdb --rm --publish 5432:5432 --detach docker.registry.zxteam.net/pub/docker/test/postgres10:1


# Start postgres10emptytestdb container + run tests
docker kill postgres10emptytestdb; docker rm postgres10emptytestdb; docker run --name postgres10emptytestdb --rm --publish 5432:5432 --detach docker.registry.zxteam.net/pub/docker/test/postgres10:1; sleep 5; npm run build && npm run prepare:devdb && npm run test:local

## Start postgres10emptytestdb container
docker kill postgres10emptytestdb; docker rm postgres10emptytestdb; docker run --name postgres10emptytestdb --rm --publish 5432:5432 --detach docker.registry.zxteam.net/pub/docker/test/postgres10:1


## Start postgres10emptytestdb container + run tests
docker kill postgres10emptytestdb; docker rm postgres10emptytestdb; docker run --name postgres10emptytestdb --rm --publish 5432:5432 --detach docker.registry.zxteam.net/pub/docker/test/postgres10:1; sleep 5; npm run build && npm run prepare:devdb && npm run test:local

## Quick test

1. Run service itself
	```shell
	npm start
	```
1. Send few test messages
	```shell
	curl --verbose --data '{"a":42}' http://127.0.0.1:8080/v2/callback/cryptoproviders/pss-provider-wtf2
	```
1. Run WebSocket consumer to obtain messages
	```shell
	npm install --global wscat
	wscat --connect ws://127.0.0.1:8080/subscriber/websockethost/devel
	```
## Start postgres10emptytestdb container
docker kill postgres10emptytestdb; docker rm postgres10emptytestdb; docker run --name postgres10emptytestdb --rm --publish 5432:5432 --detach docker.registry.zxteam.net/pub/docker/test/postgres10:1


## Start postgres10emptytestdb container + run tests
docker kill postgres10emptytestdb; docker rm postgres10emptytestdb; docker run --name postgres10emptytestdb --rm --publish 5432:5432 --detach docker.registry.zxteam.net/pub/docker/test/postgres10:1; sleep 5; npm run build && npm run prepare:devdb && npm run test:local

## Dry Run

### Sender >--HTTP--> EdgeBus >--WebSocket connection established by Consumer--> Consumer

1. Configure egress as WebSocketHost
1. Run service itself
	```shell
	npm start
	```
1. Send few test messages
	```shell
	curl --verbose --header 'Content-Type: application/json' --data '{"a":42}' http://127.0.0.1:8082/webhooks/sumsub
	```
1. Run WebSocket consumer to obtain messages
	```shell
	npm install --global wscat
	wscat --connect ws://127.0.0.1:8083/egress/websocket_host/EGRS319ef1447b054a5292acecf40345b89b
	```

### Sender >--HTTP--> EdgeBus >--HTTP--> Consumer

1. Configure egress as HTTP Sender
1. Run service itself
	```shell
	npm start
	```
1. Send few test messages
	```shell
	curl --verbose --header 'Content-Type: application/json' --data '{"a":42}' http://127.0.0.1:8082/v2/callback/fireblocks
	```
1. Run HTTP Servers consumer to obtain messages
	```shell
	docker run --rm --interactive --tty --env DUMP_FILE=false --publish 127.0.0.1:8020:8080/tcp theanurin/http-dump
	```

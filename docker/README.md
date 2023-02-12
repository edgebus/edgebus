```shell
docker build \
  --build-arg BUILD_CONFIGURATION=snapshot \
  --build-arg BUILD_COMMIT_REF=workcopy \
  --build-arg BUILD_COMMIT_TIMESTAMP=$(date +"%Y-%m-%d") \
  --build-arg BUILD_PIPELINE_URL=http://localhost \
  --build-arg BUILD_PROJECT_URL=http://localhost \
  --build-arg BUILD_VERSION_APPENDER=-local \
  --tag edgebus \
  --file docker/Dockerfile \
  . \
  && docker run --rm -it \
    --env "server.main.type=http" \
    --env "server.main.listenPort=8080" \
    --publish 8080:8080 \
    edgebus
```

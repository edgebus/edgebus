# Docker Image

## Build manually

Execute following at project root:

```bash
docker build \
  --tag edgebus \
  --file docker/Dockerfile \
  .

docker run --rm --interactive --tty \
  --publish 8080:8080 \
  edgebus
```

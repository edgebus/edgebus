# EdgeBus

[EdgeBus](https://docs.edgebus.io) is an application level network edge bus that adds connectivity, auditability, and observability to your apps with no code changes.

## Documentation

This is `docs` branch of **EdgeBus** multi project repository based on [orphan](https://git-scm.com/docs/git-checkout#Documentation/git-checkout.txt---orphanltnew-branchgt) branches.

The branch contains documentation sources.

## Development

### Jekyll via Docker
1. Build the site and make it available on a local server inside [Docker](https://www.docker.com/)
  ```shell
  docker run --interactive --rm --volume ${PWD}:/data --publish 4000:4000 zxteamorg/jekyll:20220815
  ```
1. Browse to http://127.0.0.1:4000

### Jekyll local
1. Install Jekyll. See https://jekyllrb.com/docs/
1. Build the site and make it available on a local server
	```shell
	cd docs
	bundle update
	jekyll serve --host 127.0.0.1 --port 4000
	```
1. Browse to http://127.0.0.1:4000


### Update Gemfile.lock

```shell
docker run --interactive --rm --volume ${PWD}:/data --entrypoint /bin/sh zxteamorg/jekyll:20220815 -c 'cd /data && bundle install'
```

# EdgeBus Local Deployment

## Get started

* [ ] (Optionally) Create a file `startup.config.local`. Use this file for override startup configuration variables defined in the file `startup.config`.
* [ ] Up local deployment zone by call one of
  * `./up.sh [--force-pull] [-- <Docker Compose Arguments>]`
  * `./up.sh --force-pull -- --detach`
  * `./up.sh --force-pull; sleep 1; ./down.sh`

---

## Resources over port mapping

### Infra (on Docker host)

* [52010 pgAdmin](http://127.0.0.1:52010)
* [52011 Redis Commander](http://127.0.0.1:52011)
* 52000 PostgreSQL endpoint `postgres://devadmin@127.0.0.1:52000/devdb`
* 52001 Redis Endpoint `redis://127.0.0.1:52001`
* 52003 HTTP Dump

### Runtime (on Docker host)

* [12001 EdgeBus Management Endpoint](http://127.0.0.1:12001)
  * [EdgeBus Bull Dashboard](http://127.0.0.1:12001/admin/queues/)
* [12002 EdgeBus Ingress Endpoint](http://127.0.0.1:12003)
* [12003 EdgeBus Egress Endpoint](http://127.0.0.1:12003)

## Known Issues

* pgAdmin does not setup servers list if stop initial launch


## Notes

### Docker

* Cleanup Docker volumes
    ```shell
    docker volume prune
    ```
* Cleanup Docker all (images, networks, volumes)
    ```shell
    docker system prune --all --volumes
    ```

### Follow Logs

```shell
docker logs --follow edgebus-local-deployment-edgebus-1
```

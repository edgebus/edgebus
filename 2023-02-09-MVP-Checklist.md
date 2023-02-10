- [ ] Setup database migrations
- [x] Bump Freemework version
- [ ] Review/update DB structure for the MVP
- [ ] Add audit middleware/SQLs and setup for publisher router
- [ ] Implement DBFacade with necessary set of methods to save:
  - [ ] Add tb_message record
  - [ ] Add tb_delivery/tb_delivery_failure/tb_delivery_success record
- [ ] Implement HttpSubscriber.ts
- [ ] Inject DBFacade calls into MessageBusLocal.ts/HttpSubscriber.ts
- [ ] Refactor Dockerfile
- [ ] Setup Manager for Publisher/Subscriber to be able to launch from scratch
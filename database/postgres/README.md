# EdgeBus Database

## Quick Start

1. Ensure your have been started local deployment Docker Compose (see separate repo for `deployment-local`) that provides PostgreSQL server
1. Use `ZONE=local ./migration-up.sh` script to migrate up to latest version
1. Use `./migration-down.sh` script to migrate down to current production version
1. Use `./seed.sh` script to apply seed scripts
1. Also you may use `./migration-down.sh` script to build migration scripts (but this call included by default into `migration-up.sh`)

---

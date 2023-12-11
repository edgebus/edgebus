#!/bin/bash

set -e

INPUT=$(cat)

EDGE_BUS_INSTANCE_HOSTNAME=$(hostname)

echo "Unable to resolve message labels. Error on host ${EDGE_BUS_INSTANCE_HOSTNAME}" >&2

exit 1

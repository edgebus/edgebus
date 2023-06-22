#!/bin/bash

set -e

INPUT=$(cat)

EDGE_BUS_INSTANCE_HOSTNAME=$(hostname)

echo "Unable to resolve message labels." >&2

sleep 1

echo "Error on host ${EDGE_BUS_INSTANCE_HOSTNAME}" >&2

exit 1

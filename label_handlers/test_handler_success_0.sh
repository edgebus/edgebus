#!/bin/bash

set -e

INPUT=$(cat)

#RESULT=$(echo $INPUT | jq '.labels += [ "TEST_ENV" ]')

EDGE_BUS_INSTANCE_HOSTNAME=$(hostname)

echo "[\"hostname=${EDGE_BUS_INSTANCE_HOSTNAME}\"]"

exit 0

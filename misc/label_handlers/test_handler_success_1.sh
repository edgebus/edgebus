#!/bin/bash

set -e

INPUT=$(cat)

#RESULT=$(echo $INPUT | jq '.labels += [ "TEST_ENV" ]')

EDGE_BUS_INSTANCE_HOSTNAME=$(hostname)

echo "["
sleep 1
echo "	\"hostname=${EDGE_BUS_INSTANCE_HOSTNAME}\""
sleep 1
echo "]"

exit 0

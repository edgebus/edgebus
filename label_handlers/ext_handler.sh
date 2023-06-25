#!/bin/bash

INPUT=$(cat)
RESULT=$(echo $INPUT | jq '.labels += [ "TEST_ENV" ]')

echo '["ENV_DEV", "ENV_PROD"]'

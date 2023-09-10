#!/bin/bash

INPUT=$(cat)
EXTERNAL_USER_ID=$(echo $INPUT | jq '.data.destination.name')

echo \{\"headers\":null,\"body\":${EXTERNAL_USER_ID},\"statusCode\":202,\"statusDescription\":\"testOk\"\}

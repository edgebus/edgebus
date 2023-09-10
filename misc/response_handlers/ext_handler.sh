#!/bin/bash

INPUT=$(cat)
EXTERNAL_USER_ID=$(echo $INPUT | jq '.data.destination.name' | base64)

echo \{\"headers\":null,\"bodyBase64\":${EXTERNAL_USER_ID},\"statusCode\":202,\"statusDescription\":\"testOk\"\}

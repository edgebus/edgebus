#!/bin/bash

INPUT=$(cat)
EXTERNAL_USER_ID=$(echo $INPUT | jq '.data.destination.name')

LABEL=$(echo $EXTERNAL_USER_ID | grep -o '[A-Z_]\+')
LABEL=$(echo $LABEL | grep -o '[A-Z]\+')

if [ -z "$LABEL" ]
then
 	echo []
else
	echo [\"$LABEL\"]
fi

#!/usr/bin/env python3
#

import sys, json
import re

body = json.load(sys.stdin)

#
#
# (test)
# (presentation)
# (evolution)
# (sandbox:ex1234)
# (local:user@hostname)
#

result = []

if body["type"] == "TRANSACTION_CREATED" or body["type"] == "TRANSACTION_STATUS_UPDATED":
	destination = body.get("data",{}).get("destination",{})
	if destination is not None:
		destinationName = destination.get("name")
		destinationType = destination.get("type")
		if destinationName is not None and destinationType == "VAULT_ACCOUNT":
			destinationNameMatch = re.search('^\\((.+)\\) .+$', destinationName)
			if destinationNameMatch is not None:
				destinationNameLabel = destinationNameMatch.group(1)
				if destinationNameLabel not in result:
					result.append(destinationNameLabel)
					print("Detect label '%s' according by type == 'TRANSACTION_CREATED/TRANSACTION_STATUS_UPDATED'" % destinationNameLabel, file=sys.stderr)

	source = body.get("data",{}).get("source",{})
	if source is not None:
		sourceName = destination.get("name")
		sourceType = destination.get("type")
		if sourceName is not None and sourceType == "VAULT_ACCOUNT":
			sourceNameMatch = re.search('^\\((.+)\\) .+$', sourceName)
			if sourceNameMatch is not None:
				sourceNameLabel = sourceNameMatch.group(1)
				if sourceNameLabel not in result:
					result.append(sourceNameLabel)
					print("Detect label '%s' according by type == 'TRANSACTION_CREATED/TRANSACTION_STATUS_UPDATED'" % sourceNameLabel, file=sys.stderr)

elif body["type"] == "VAULT_ACCOUNT_ASSET_ADDED":
	accountName = body.get("accountName")
	if accountName is not None:
		accountNameMatch = re.search('^\\((.+)\\) .+$', accountName)
		if accountNameMatch is not None:
			accountNameLabel = accountNameMatch.group(1)
			if accountNameLabel not in result:
				result.append(accountNameLabel)
				print("Detect label '%s' according by type == 'VAULT_ACCOUNT_ASSET_ADDED'" % accountNameLabel, file=sys.stderr)
else:
	print("No any fields to detect labels", file=sys.stderr)

json.dump(result, sys.stdout)

#!/usr/bin/env python3
#

import sys, json
import re

body = json.load(sys.stdin)

#
# (production)
# (test)
# (presentation)
# (evolution)
# (sandbox:ex1234)
# (local:user@hostname)
#

result = []

if "type" in body:
	messageType = body["type"]
	print("Handling message type '%s'" % messageType, file=sys.stderr)

	if messageType == "TRANSACTION_CREATED" or messageType == "TRANSACTION_STATUS_UPDATED":
		destination = body.get("data",{}).get("destination",{})
		if destination is not None:
			destinationName = destination.get("name")
			destinationType = destination.get("type")
			print("destinationName '%s'" % destinationName, file=sys.stderr)
			print("destinationType '%s'" % destinationType, file=sys.stderr)
			if destinationName is not None and destinationType == "VAULT_ACCOUNT":
				destinationNameMatch = re.search('^\\((.+)\\):[0-9]{14} .+$', destinationName)
				if destinationNameMatch is not None:
					destinationNameLabel = destinationNameMatch.group(1)
					if destinationNameLabel not in result:
						result.append(destinationNameLabel)
						print("Detect label '%s' according by type == 'TRANSACTION_CREATED/TRANSACTION_STATUS_UPDATED'" % destinationNameLabel, file=sys.stderr)

		source = body.get("data",{}).get("source",{})
		if source is not None:
			sourceName = source.get("name")
			sourceType = source.get("type")
			print("sourceName '%s'" % sourceName, file=sys.stderr)
			print("sourceType '%s'" % sourceType, file=sys.stderr)
			if sourceName is not None and sourceType == "VAULT_ACCOUNT":
				sourceNameMatch = re.search('^\\((.+)\\):[0-9]{14} .+$', sourceName)
				if sourceNameMatch is not None:
					sourceNameLabel = sourceNameMatch.group(1)
					if sourceNameLabel not in result:
						result.append(sourceNameLabel)
						print("Detect label '%s' according by type == 'TRANSACTION_CREATED/TRANSACTION_STATUS_UPDATED'" % sourceNameLabel, file=sys.stderr)

	elif body["type"] == "VAULT_ACCOUNT_ASSET_ADDED":
		accountName = body.get("data",{}).get("accountName")
		print("accountName '%s'" % accountName, file=sys.stderr)
		if accountName is not None:
			accountNameMatch = re.search('^\\((.+)\\):[0-9]{14} .+$', accountName)
			if accountNameMatch is not None:
				accountNameLabel = accountNameMatch.group(1)
				if accountNameLabel not in result:
					result.append(accountNameLabel)
					print("Detect label '%s' according by type == 'VAULT_ACCOUNT_ASSET_ADDED'" % accountNameLabel, file=sys.stderr)
	else:
		print("No any fields to detect labels", file=sys.stderr)

else:
	print("Received a message without 'type' field.", file=sys.stderr)
	json.dump(result, sys.stderr)

json.dump(result, sys.stdout)

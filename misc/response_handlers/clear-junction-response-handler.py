#!/usr/bin/env python3
#

import base64, json, sys

inputData = json.load(sys.stdin)

outputBodyStr: str = ""

if "orderReference" in inputData:
	orderReference = inputData["orderReference"]
	if isinstance(orderReference, str):
		print("Handling message with orderReference '%s'" % orderReference, file=sys.stderr)
		outputBodyStr: str = orderReference
	else:
		print("Received a message with wrong type of 'orderReference' field.", file=sys.stderr)
		json.dump(inputData, sys.stderr)
else:
	print("Received a message without 'orderReference' field.", file=sys.stderr)
	json.dump(inputData, sys.stderr)


outputData = {
	"headers": [
		"Content-Type: text/plain"
	],
	"bodyBase64": base64.b64encode(outputBodyStr.encode('utf-8')).decode('utf-8'),
	"statusCode": 200,
	"statusDescription": "OK"
}

json.dump(outputData, sys.stdout)

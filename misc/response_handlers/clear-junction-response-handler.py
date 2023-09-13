#!/usr/bin/env python3
#

import base64, json, sys

inputDataJson = json.load(sys.stdin)

outputDataStr = json.dumps({ "data": str(inputDataJson["data"]["a"]) })

result = {
	"headers": [],
	"bodyBase64": base64.b64encode(outputDataStr.encode('utf-8')).decode('utf-8'),
	"statusCode": 200,
	"statusDescription": "testOk"
}

json.dump(result, sys.stdout)

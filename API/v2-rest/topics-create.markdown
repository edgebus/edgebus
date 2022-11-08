---
layout: default
nav_order: 6
title: Topics Create
grand_parent: API
parent: v2 (REST)
description: "TBD"
---

### Topics Create

```
>>>
POST /v2/topic HTTP/1.1
Host: api.edgebus.io
Content-Type: application/json
Accept: */*

{% cat schemas/v2/topic/topic.create-request.SAMPLE-0.json %}

<<<
HTTP/1.1 200 OK
Content-Length: ...
Content-Type: application/json; charset=utf-8
Date: ...

{% cat schemas/v2/topic/topic.SAMPLE-0.json %}
```

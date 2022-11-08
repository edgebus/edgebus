---
layout: default
nav_order: 5
title: Topics List
grand_parent: API
parent: v2 (REST)
description: "TBD"
---

### Topics List

Retrieve a list of topics.

**Parameters:**

| **Name**      | **Type** | **Mandatory** | **Description**                                                                          |
| ------------- | -------- | ------------- | ---------------------------------------------------------------------------------------- |
| **name**      | STRING   | NO            | Filter by `name`. Parts of topic name                                                    |
| **startDate** | ISO 8601 | NO            | Date of create topic, from INCLUSIVE                                                     |
| **endDate**   | ISO 8601 | NO            | Date of create topic, until EXCLUSIVE                                                    |
| **beforeId**  | STRING   | NO            | Request page before (newer) this pagination id. [Pagination's param](#pagination).       |
| **afterId**   | STRING   | NO            | Request page after (older) this pagination id. [Pagination's param](#pagination).        |
| **limit**     | INT      | NO            | Number of results per request. Default 500; max 1000. [Pagination's param](#pagination). |

```
>>>
GET /v2/topic?limit=2&name=pic&startDate=2020-01-01T00%3A00%3A00.000Z HTTP/1.1
Host: api.edgebus.io
Accept: */*

<<<
HTTP/1.1 200 OK
Content-Length: ...
Content-Type: application/json; charset=utf-8
Date: ...

{% cat schemas/v2/topic/topic-list.SAMPLE-0.json %}
```

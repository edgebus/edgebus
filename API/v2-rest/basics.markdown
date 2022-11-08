---
layout: default
nav_order: 1
title: Basics
grand_parent: API
parent: v2 (REST)
description: "TBD"
---

# Basics

- Data is returned in ascending order. Oldest first, newest last.
- All time and timestamp related fields are in [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601).
- GET and HEAD methods, parameters must be sent as a [query string](https://en.wikipedia.org/wiki/Query_string).
- POST and PUT the parameters are sent in the request body with content type `application/json`.
- DELETE methods do not have any parameters.
- Success request codes: 2XX
- Client's mistakes: 4XX
- Server's errors: 5XX

{: .important }
Almost POST and PUT methods are temporary idempotent. Any duplicate request will be completed with response of the first request within 24 hours from the first request. This behaviour in conclusion with client identifier prevents potential entry duplicates.

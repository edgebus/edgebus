---
layout: default
nav_order: 1
title: Basics
grand_parent: API
parent: v2 (WebSocket)
description: "TBD"
---

# Basics

- Data is returned in ascending order. Oldest first, newest last.
- All time and timestamp related fields are in [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601).

{: .important }
Modification methods are temporary idempotent. Any duplicate request will be completed with response of the first request within 24 hours from the first request. This behaviour in conclusion with client identifier prevents potential entry duplicates.

---
layout: default
nav_order: 3
title: Pagination
grand_parent: API
parent: v2 (REST)
description: "TBD"
---

# Pagination

We uses cursor pagination for all REST requests which return arrays. Cursor pagination allows for fetching results after the current page of results and is well suited for realtime data. Endpoints return the latest items by default. To retrieve more results subsequent requests should specify which direction to paginate based on the data previously returned.

**beforeId** and **afterId** cursors are available via response headers **EB-BEFORE** and **EB-AFTER**. Your requests should use these cursor values when making requests for pages after the initial request.

**Parameters:**

| **Name** | **Type** | **Mandatory** | **Description**                                      |
| -------- | -------- | ------------- | ---------------------------------------------------- |
| beforeId | STRING   | NO            | Request page before (newer) this pagination id.      |
| afterId  | STRING   | NO            | Request page after (older) this pagination id.       |
| limit    | INT      | NO            | Number of results per request. Default 500; max 1000 |

{: .important }
**before** and **after** cursor arguments should not be confused with before and after in chronological time. Most paginated requests return the latest information (newest) as the first page sorted by newest (in chronological time) first. To get older information you would request pages after the initial page. To get information newer, you would request pages before the first page.

---
layout: default
nav_order: 2
title: Responses
grand_parent: API
parent: v2 (REST)
description: "TBD"
---

# Responses

Our API uses [HTTP status codes](http://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml) to indicate the status of your requests. This includes successful and unsuccessful responses.

- 2xx (Successful): The request was successfully received, understood, and accepted
- 4xx (Client Error): The request contains bad syntax or cannot be fulfilled
- 5xx (Server Error): The server failed to fulfill an apparently valid request

{: .important }
5xx: It is important to NOT treat this as a failure operation. The execution status is UNKNOWN and could have been a success.

{: .important }
Error Reason Phrase: An unsuccessful response DOES NOT HAVE body. An ASCII error message truncated to 512 symbols passed as **EB-REASON-PHRASE** header and truncated to 128 symbols passed as [Reason Phrase](https://www.rfc-editor.org/rfc/rfc2616.html#section-6.1.1).

| **Status Code**           | **Meaning**                                                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 200 OK                    | Standard response for successful HTTP requests                                                                                                                                                    |
| 201 Created               | The request has been fulfilled, resulting in the creation of a new resource                                                                                                                       |
| 202 Accepted              | The request has been accepted for processing, but the processing has not been completed                                                                                                           |
| 400 Bad Request           | The server cannot or will not process the request due to an apparent client error (e.g., malformed request syntax, size too large, invalid request message framing, or deceptive request routing) |
| 401 Unauthorized          | Most likely you wasn't able to construct and sign your API request correctly using HMAC                                                                                                           |
| 403 Forbidden             | You don't have required permissions to perform requested action on the resource                                                                                                                   |
| 404 Not Found             | We don't have the resource you've requested                                                                                                                                                       |
| 422 Unprocessable Entity  | The request was well-formed but was unable to be followed due to semantic errors                                                                                                                  |
| 500 Internal Server Error | We have a problem with our server                                                                                                                                                                 |
| 501 Not Implemented       | Just not implemented yet :)                                                                                                                                                                       |
| 503 Service Unavailable   | We're temporarily offline for maintenance                                                                                                                                                         |

---
layout: default
nav_order: 4
title: Types
grand_parent: API
parent: v2 (REST)
description: "TBD"
---

## Types

### IDs

Most of identifiers are UUID-based with kind prefix.

For example topic identifier EBT-8075c1c9d7334be0860e3b57f0de43e5 comes from UUID 8075c1c9-d733-4be0-860e-3b57f0de43e5

```json
{
  "topicId": "EBT-8075c1c9d7334be0860e3b57f0de43e5"
}
```

{: .important }
Case insensitive: UUID digits are case insensitive (not prefix). Values EBT-8075c1c9d7334be0860e3b57f0de43e5 and EBT-8075C1C9d7334BE0860E3B57F0DE43E5 are same identifier. Prefix always in upper case.

### Dates

All timestamps from API are returned in [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) with milliseconds. Make sure you can parse the following ISO 8601 format. Most modern languages and libraries will handle this without issues.

```json
{
  "date": "2020-01-16T07:35:32.129Z"
}
```

### Decimal (Financial)

All numbers that represent financial values are returned as strings to preserve full precision across platforms. When making a request, you must convert your numbers to strings to avoid truncation and precision errors.

```json
{
  "amount": "12345678.12345678"
}
```

### Integer

Integer numbers (like counter) are unquoted.

```json
{
  "confirmations": 5
}
```

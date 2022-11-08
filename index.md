---
layout: default
title: Welcome
nav_order: 1
description: "TBD"
permalink: /
---

# Welcome

<p align="center" width="100%">
    <img src="assets/images/edgebus-overview-architecture.png" alt="EdgeBus Overview Architecture">
</p>

EdgeBus is an open-source server application that makes your life easy in production integration of different systems and make development a fun and easy experience.

There are two main goals:
* manage, audit, transform and guarantee delivery asynchronous messages
* audit, transform and retry synchronous calls

## Asynchronous Messages

Basically, these days, mostly each project requires to receive and deliver asynchronous messages with external systems.
There are a lot of terrible parts to handle this task such a guaranteed delivery, audit, manage event endpoints.

EdgeBus provides set of features in scope related to Asynchronous Messages:

* Audit messages and delivery evidences
* Performance counters
* Delivery retry policy
* [Protocol switching]({{ "/glossary/#protocol-switching" | relative_url }})
* Transform payload
* Manual retry message delivery

Similar products:

* [Amazon SNS](https://docs.aws.amazon.com/sns/latest/dg/welcome.html)
* [Azure Service Bus](https://azure.microsoft.com/en-us/products/service-bus/)
* [Google Cloud Pub/Sub](https://cloud.google.com/pubsub)


## Synchronous Calls

If your application is not lived in a vacuum it, probably, call to external API(s) to obtain data.
Unfortunately, a lot of developers have thoughts the external system always available and network always no issues.

EdgeBus provides set of features in scope related to Synchronous Calls:

* Audit calls
* Performance counters
* [Protocol switching]({{ "/glossary/#protocol-switching" | relative_url }})
* Transform payload
* Reverse proxy

Similar products:

* [ngrok](https://ngrok.com/)

{: .note }
Join our [Google Group](TBD) to ask questions.

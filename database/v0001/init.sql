DROP TABLE IF EXISTS "subscriber_topics";
DROP TABLE IF EXISTS "delivery_subscriber";
DROP TABLE IF EXISTS "delivery_opts";
DROP TABLE IF EXISTS "deliveries";
DROP TABLE IF EXISTS "subscribers";
DROP TABLE IF EXISTS "messages";
DROP TABLE IF EXISTS "topics";
CREATE TABLE "delivery_opts"
(
	"id" BIGSERIAL NOT NULL PRIMARY KEY,
	"webhookUrl" VARCHAR(128),

	CONSTRAINT "uq_delivery_opts_id" UNIQUE ("id")
);

CREATE TABLE "topics"
(
	"id" BIGSERIAL NOT NULL PRIMARY KEY,
	"name" VARCHAR(128) NOT NULL,
	"description" VARCHAR(1028) NOT NULL,

	CONSTRAINT "uq_topics_id" UNIQUE ("id")
);

INSERT INTO "topics" ("id", "name", "description")
VALUES (1, 'market', 'Market currency');

INSERT INTO "topics" ("id", "name", "description")
VALUES (2, 'trade', 'Trade currency');

CREATE TABLE "subscribers"
(
	"id" BIGSERIAL NOT NULL PRIMARY KEY,
	"name" VARCHAR(128),

	CONSTRAINT "uq_subscribers_id" UNIQUE ("id")
);

CREATE TABLE "deliveries"
(
	"id" BIGSERIAL NOT NULL PRIMARY KEY,
	"name" VARCHAR(128) NOT NULL,
	"description" VARCHAR(1028) NOT NULL,

	CONSTRAINT "uq_deliveries_id" UNIQUE ("id")
);

INSERT INTO "deliveries" ("id", "name", "description")
VALUES (1, 'WebHook', 'Web hooks are a incredibly useful and a resource-light way to implement event reactions');

CREATE TABLE "delivery_subscriber"
(
	"id" BIGSERIAL NOT NULL PRIMARY KEY,
	"subscriberId" BIGINT REFERENCES subscribers(id) NOT NULL,
	"deliveryId" BIGINT REFERENCES deliveries(id) NOT NULL,
	"deliverySettingId" BIGINT REFERENCES delivery_opts(id) NOT NULL,

	CONSTRAINT "uq_delivery_subscriber_id" UNIQUE ("id")
);

CREATE TABLE "subscriber_topics"
(
	"id" BIGSERIAL NOT NULL PRIMARY KEY,
	"tipicId" BIGINT REFERENCES topics(id) NOT NULL,
	"subcriberId" BIGINT REFERENCES subscribers(id) NOT NULL,
	"deliverySubscriberId" BIGINT REFERENCES delivery_subscriber(id) NOT NULL,

	CONSTRAINT "uq_subscriber_topics_id" UNIQUE ("id")
);

CREATE TABLE "messages"
(
	"id" BIGSERIAL NOT NULL PRIMARY KEY,
	"topicId" BIGINT REFERENCES topics(id) NOT NULL,
	"message" VARCHAR(1028) NOT NULL,

	CONSTRAINT "uq_messages_id" UNIQUE ("id")
);

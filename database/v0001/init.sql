DROP TABLE IF EXISTS "subscriber_webhook";
DROP TABLE IF EXISTS "topic";

CREATE TABLE "topic"
(
	"id" SERIAL NOT NULL PRIMARY KEY,
	"name" VARCHAR(256) NOT NULL,
	"description" VARCHAR(1028) NOT NULL,
	"topic_security" VARCHAR(1028) NOT NULL,
	"publisher_security" VARCHAR(1028) NOT NULL,
	"subscriber_security" VARCHAR(1028) NOT NULL,
	"utc_create_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_delete_date" TIMESTAMP WITHOUT TIME ZONE NULL,

	CONSTRAINT "uq_topic_name" UNIQUE ("name")
);

CREATE TABLE "subscriber_webhook"
(
	"id" SERIAL NOT NULL PRIMARY KEY,
	"topic_id" INT REFERENCES topic(id) NOT NULL,
	"url" VARCHAR(1028) NOT NULL,
	"connection_details" VARCHAR(4096),
	"utc_create_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_delete_date" TIMESTAMP WITHOUT TIME ZONE NULL
);

INSERT INTO "topic" ("id", "name", "description", "topic_security", "publisher_security", "subscriber_security", "utc_delete_date")
VALUES (1, 'market', 'Market currency', 's', 'd', 'as', (NOW() AT TIME ZONE 'utc'));

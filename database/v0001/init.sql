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

	CONSTRAINT "uq_topics_name" UNIQUE ("name")
);

CREATE TABLE "subscriber_webhook"
(
	"id" SERIAL NOT NULL PRIMARY KEY,
	"topic_id" INT REFERENCES topic(id) NOT NULL,
	"url" VARCHAR(1028) NOT NULL,
	"webhook_secutiry" VARCHAR(4096),

	CONSTRAINT "uq_delivery_opts_id" UNIQUE ("id")
);

-- INSERT INTO "topic" ("id", "name", "description")
-- VALUES (1, 'market', 'Market currency');

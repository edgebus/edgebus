-- DROP TABLE IF EXISTS "subscriber_webhook";
-- DROP TABLE IF EXISTS "publisher_http";
-- DROP TABLE IF EXISTS "topic";

CREATE TABLE "topic"
(
	"id" SERIAL NOT NULL PRIMARY KEY,
	"name" VARCHAR(256) NOT NULL,
	"description" VARCHAR(1028) NOT NULL,
	"media_type" VARCHAR(1028) NOT NULL,
	"topic_security" VARCHAR(1028) NOT NULL,
	"publisher_security" VARCHAR(1028) NOT NULL,
	"subscriber_security" VARCHAR(1028) NOT NULL,
	"utc_create_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_delete_date" TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL,

	CONSTRAINT "uq_topic_name" UNIQUE ("name")
);

CREATE TABLE "subscriber_webhook"
(
	"id" SERIAL NOT NULL PRIMARY KEY,
	"webhook_id" VARCHAR(64) NOT NULL,
	"topic_id" INT REFERENCES topic(id) NOT NULL,
	"url" VARCHAR(1028) NOT NULL,
	"trusted_ca_certificate" VARCHAR(4096) NULL DEFAULT NULL,
	"header_token" VARCHAR(512) NULL DEFAULT NULL,
	"utc_create_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_delete_date" TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL,

	CONSTRAINT "uq_subscriber_webhook_topic_id_url_utc_delete_date" UNIQUE ("topic_id", "url", "utc_delete_date")
);

CREATE TABLE "publisher_http"
(
	"id" VARCHAR(64) NOT NULL PRIMARY KEY,
	"topic_id" INT REFERENCES topic(id) NOT NULL,
	"ssl_opts" JSONB,
	"utc_create_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_delete_date" TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL
);



-- INSERT INTO "topic" ("id", "name", "description", "media_type", "topic_security", "publisher_security", "subscriber_security")
-- VALUES (1, 'market', 'Market currency', 's', 's', 'd', 'as');

-- INSERT INTO "subscriber_webhook" ("webhook_id", "topic_id", "url", "trusted_ca_certificate", "header_token")
-- VALUES ('market', 1, 's', 's', 'd');

-- INSERT INTO "publisher_http" (id, topic_id, ssl_opts) 
-- VALUES ('id', (SELECT id FROM topic WHERE name = 'market'), '"text"');

-- SELECT 	p.id, p.topic_id, p.ssl_opts, p.utc_create_date, p.utc_delete_date, t.publisher_security FROM publisher_http AS p 
-- INNER JOIN topic AS t ON t.id=p.topic_id WHERE p.id='id';

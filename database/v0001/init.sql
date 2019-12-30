CREATE TABLE "tb_topic" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"name" VARCHAR(256) NOT NULL,
	"description" VARCHAR(1028) NOT NULL,
	"media_type" VARCHAR(128) NOT NULL,
	"topic_security" JSONB NOT NULL,
	"publisher_security" JSONB NOT NULL,
	"subscriber_security" JSONB NOT NULL,
	"utc_create_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	CONSTRAINT "uq_topic_name" UNIQUE ("name")
);

CREATE TABLE "tb_publisher" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"publisher_uuid" UUID NOT NULL,
	"topic_id" INT REFERENCES "tb_topic"("id") NOT NULL,
	"destroy_security" JSONB NOT NULL,
	"opts" JSONB NOT NULL,
	"converts" JSONB NOT NULL,
	"utc_create_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	CONSTRAINT "uq__tb_publisher__publisher_uuid" UNIQUE ("publisher_uuid")
);

CREATE TABLE "tb_subscriber" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"subscriber_uuid" UUID NOT NULL,
	"topic_id" INT REFERENCES "tb_topic"("id") NOT NULL,
	"destroy_security" JSONB NOT NULL,
	"opts" JSONB NOT NULL,
	"converts" JSONB NOT NULL,
	"utc_create_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	CONSTRAINT "uq__tb_subscriber__subscriber_uuid" UNIQUE ("subscriber_uuid")
);

CREATE TABLE "tb_message" (
	"id" BIGSERIAL NOT NULL PRIMARY KEY,
	"topic_id" INT REFERENCES "tb_topic"("id") NOT NULL,
	"publisher_id" INT REFERENCES "tb_publisher"("id") NOT NULL,
	"body" BYTEA NOT NULL,
	"utc_create_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE TABLE "tb_delivery" (
	"id" BIGSERIAL NOT NULL PRIMARY KEY,
	"message_id" BIGINT REFERENCES "tb_message"("id") NOT NULL,
	"subscriber_id" INT REFERENCES "tb_subscriber"("id") NOT NULL,
	"utc_create_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_delivery_date" TIMESTAMP WITHOUT TIME ZONE NULL,
	"delivery_evidence" JSONB NULL
);

CREATE TABLE "tb_delivery_failure" (
	"id" BIGSERIAL NOT NULL PRIMARY KEY,
	"delivery_id" BIGINT REFERENCES "tb_delivery"("id") NOT NULL,
	"utc_failure_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	"failure_evidence" JSONB NOT NULL
);

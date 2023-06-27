CREATE TABLE "{{database.schema.runtime.name}}"."tb_message" (
	"id" BIGSERIAL NOT NULL,
	"api_uuid" UUID NOT NULL,
	"topic_id" INT NOT NULL,
	"ingress_id" INT NOT NULL,
	"media_type" VARCHAR(64) NULL,
	"body" BYTEA NULL,
	"original_body" BYTEA NULL,
	"headers" JSONB NOT NULL,
	"utc_created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),

	CONSTRAINT "pk__tb_message"
	PRIMARY KEY ("id"),

	CONSTRAINT "pk__tb_message__topic__integrity"
	UNIQUE ("id", "topic_id"),

	CONSTRAINT "pk__tb_message__topic_ingress__integrity"
	UNIQUE ("id", "topic_id", "ingress_id"),

	CONSTRAINT "uq__tb_message__api_uuid"
	UNIQUE ("api_uuid"),

	CONSTRAINT "fk__tb_message__tb_ingress"
	FOREIGN KEY ("ingress_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_ingress" ("id"),

	CONSTRAINT "fk__tb_message__tb_topic"
	FOREIGN KEY ("topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_topic" ("id"),

	CONSTRAINT "fk__tb_message__tb_ingress__integrity"
	FOREIGN KEY ("ingress_id", "topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_ingress" ("id", "topic_id"),

	CONSTRAINT "ck__tb_message__body"
	CHECK (("original_body" IS NULL) OR ("original_body" IS NOT NULL AND "body" IS NOT NULL))
);

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_message" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_message" TO "{{database.user.api}}";

COMMENT ON CONSTRAINT "ck__tb_message__body"
ON "{{database.schema.runtime.name}}"."tb_message"
IS 'Force to set "body" if "original_body" presented.';

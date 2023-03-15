CREATE TABLE "{{database.schema.audit.name}}"."publisher_messages" (
	"id" BIGSERIAL PRIMARY KEY,
	"headers" JSONB NOT NULL,
	"mime" VARCHAR(64),
	"data_raw" BYTEA NULL,
	"utc_created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

GRANT INSERT ON TABLE "{{database.schema.audit.name}}"."publisher_messages" TO "{{database.user.api}}";

CREATE TABLE "{{database.schema.audit.name}}"."incoming_response_http" (
	"id" BIGINT NOT NULL PRIMARY KEY REFERENCES "{{database.schema.audit.name}}"."incoming_request_http" ("id"),
	"response_headers" JSONB NOT NULL,
	"response_body" JSONB NULL,
	"response_body_raw" BYTEA NULL,
	"response_status_code" INT NOT NULL,
	"response_status_message" VARCHAR(4096),
	"utc_created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

GRANT INSERT ON TABLE "{{database.schema.audit.name}}"."incoming_response_http" TO "{{database.user.api}}";

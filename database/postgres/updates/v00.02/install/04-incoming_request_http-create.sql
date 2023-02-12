CREATE TABLE "{{database.schema.audit.name}}"."incoming_request_http" (
	"id" BIGSERIAL PRIMARY KEY,
	"tag" VARCHAR(256),
	"http_method" VARCHAR(8) NOT NULL,
	"http_url" VARCHAR(2084) NOT NULL,
	"request_headers" JSONB NOT NULL,
	"request_body" JSONB NULL,
	"request_body_raw" BYTEA NULL,
	"utc_created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

GRANT INSERT ON TABLE "{{database.schema.audit.name}}"."incoming_request_http" TO "{{database.user.api}}";

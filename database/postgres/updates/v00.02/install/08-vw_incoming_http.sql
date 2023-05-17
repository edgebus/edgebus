CREATE VIEW "{{database.schema.audit.name}}"."vw_incoming_http" AS
	SELECT
		REQ."id",
		REQ."http_method",
		REQ."http_url",
		REQ."request_headers",
		REQ."request_body",
		RES."response_status_code",
		RES."response_status_message",
		RES."response_headers",
		RES."response_body",
		REQ."utc_created_at" AS "request_utc_created_at",
		RES."utc_created_at" AS "response_utc_created_at",
		REQ."tag" AS "tag",
		REQ."request_body_raw",
		RES."response_body_raw"
	FROM "{{database.schema.audit.name}}"."incoming_request_http" AS REQ
	LEFT JOIN "{{database.schema.audit.name}}"."incoming_response_http" AS RES ON RES."id" = REQ."id"
	ORDER BY id DESC;

GRANT SELECT ON TABLE "{{database.schema.audit.name}}"."vw_incoming_http" TO "{{database.user.readonly}}";

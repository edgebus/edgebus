CREATE VIEW "{{database.schema.runtime.name}}"."vw_message" AS
SELECT
	"id",
	"api_uuid",
	"topic_id",
	"ingress_id",
	"media_type",
	"transformed_body",
	CASE
		WHEN "media_type" = 'application/json' THEN CONVERT_FROM("transformed_body", 'UTF8')::JSON
		ELSE NULL
	END AS "transformed_body_json",
	"original_body",
	CASE
		WHEN "media_type" = 'application/json' THEN CONVERT_FROM("original_body", 'UTF8')::JSON
		ELSE NULL
	END AS "original_body_json",
	"headers",
	"utc_created_at"
FROM "{{database.schema.runtime.name}}"."tb_message";

GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."vw_message" TO "{{database.user.api}}";

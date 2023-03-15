CREATE VIEW "{{database.schema.audit.name}}"."vw_publisher_messages" AS
SELECT "id", "headers", "mime", "data_raw", CONVERT_FROM("data_raw", 'UTF8')::JSONB AS "json_data", "utc_created_at"
	FROM "edgebus_audit"."publisher_messages";

GRANT INSERT ON TABLE "{{database.schema.audit.name}}"."publisher_messages" TO "{{database.user.api}}";

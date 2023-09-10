ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	DROP CONSTRAINT "ck_response_handler_kind";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	DROP COLUMN "response_dynamic_handler_external_script_path";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	DROP CONSTRAINT "ck_response_kind";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	DROP COLUMN "response_dynamic_handler_kind";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	DROP COLUMN "response_kind";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ALTER COLUMN "response_static_status_code" SET NOT NULL;

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	RENAME COLUMN "response_static_body" TO "response_body";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	RENAME COLUMN "response_static_headers" TO "response_headers";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	RENAME COLUMN "response_static_status_message" TO "response_status_message";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	RENAME COLUMN "response_static_status_code" TO "response_status_code";

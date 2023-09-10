ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	RENAME COLUMN "response_status_code" TO "response_static_status_code";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	RENAME COLUMN "response_status_message" TO "response_static_status_message";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	RENAME COLUMN "response_headers" TO "response_static_headers";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	RENAME COLUMN "response_body" TO "response_static_body";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ALTER COLUMN "response_static_status_code" DROP NOT NULL;

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ADD COLUMN "response_kind" VARCHAR(32) NOT NULL;

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ADD COLUMN "response_dynamic_handler_kind" VARCHAR(32);

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ADD CONSTRAINT "ck_response_kind"
	CHECK ("response_kind" = 'STATIC' OR "response_kind" = 'DYNAMIC');

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ADD COLUMN "response_dynamic_handler_external_script_path" VARCHAR(2048);

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ADD CONSTRAINT "ck_response_handler_kind"
	CHECK (
		(
			"response_kind" = 'STATIC'
			AND
			"response_static_status_code" IS NOT NULL
			AND
			"response_dynamic_handler_kind" IS NULL
			AND
			"response_dynamic_handler_external_script_path" IS NULL
		)
		OR
		(
			"response_kind" = 'DYNAMIC'
			AND
			"response_static_status_code" IS NULL
			AND
			"response_static_status_message" IS NULL
			AND
			"response_static_headers" IS NULL
			AND
			"response_static_body" IS NULL
			AND
			"response_dynamic_handler_kind" = 'EXTERNAL_PROCESS'
			AND
			"response_dynamic_handler_external_script_path" IS NOT NULL
		)
	);

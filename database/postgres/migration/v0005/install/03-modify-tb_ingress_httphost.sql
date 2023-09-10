ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ALTER COLUMN "response_status_code" DROP NOT NULL;

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ADD COLUMN "response_kind" VARCHAR(32) NOT NULL;

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ADD COLUMN "response_handler_kind" VARCHAR(32);

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ADD COLUMN "response_handler_path" VARCHAR(2048);

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ADD CONSTRAINT "ck_response_kind"
	CHECK ("response_kind" = 'STATIC' OR "response_kind" = 'DYNAMIC');

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	ADD CONSTRAINT "ck_response_handler_kind"
	CHECK ("response_handler_kind" = 'EXTERNAL_PROCESS' OR "response_handler_kind" IS NULL);


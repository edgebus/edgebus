ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	DROP CONSTRAINT "ck_response_handler_kind";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	DROP CONSTRAINT "ck_response_kind";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	DROP COLUMN "response_handler_path";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	DROP COLUMN "response_handler_kind";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost"
	DROP COLUMN "response_kind";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_ingress_httphost" 
	ALTER COLUMN "response_status_code" SET NOT NULL; 


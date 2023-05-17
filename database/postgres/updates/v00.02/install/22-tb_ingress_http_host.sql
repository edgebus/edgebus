CREATE TABLE "{{database.schema.runtime.name}}"."tb_ingress_http_host" (
	"id" INT NOT NULL PRIMARY KEY,
	"kind" "{{database.schema.runtime.name}}"."INGRESS_KIND" NOT NULL,
	"path" VARCHAR(2048) NOT NULL,
	"response_status_code" SMALLINT NOT NULL,
	"response_status_message" VARCHAR(32) NULL,
	"response_headers" JSONB NULL,
	"response_body" BYTEA NULL,

	CONSTRAINT "ck__kind"
	CHECK ("kind" = 'HTTP_HOST'),
	
	CONSTRAINT "fk__tb_ingress_http_host__tb_ingress"
	FOREIGN KEY ("id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_ingress" ("id"),

	CONSTRAINT "fk__tb_ingress_http_host__tb_ingress__integrity"
	FOREIGN KEY ("id", "kind")
	REFERENCES "{{database.schema.runtime.name}}"."tb_ingress" ("id", "kind")
);

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_ingress_http_host" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_ingress_http_host" TO "{{database.user.api}}";

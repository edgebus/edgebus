CREATE TABLE "{{database.schema.runtime.name}}"."tb_egress_webhook" (
	"id" INT NOT NULL,
	"kind" "{{database.schema.runtime.name}}"."EGRESS_KIND" NOT NULL,
	"http_url" VARCHAR(2048) NOT NULL,
	"http_method" VARCHAR(16) NULL,

	CONSTRAINT "pk__tb_egress_http_client"
	PRIMARY KEY ("id"),

	CONSTRAINT "ck__tb_egress_http_client__kind"
	CHECK ("kind" = 'WEBHOOK'),
	
	CONSTRAINT "fk__tb_egress_http_client__tb_egress"
	FOREIGN KEY ("id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_egress" ("id"),

	CONSTRAINT "fk__tb_ingress_httphost__tb_ingress__integrity"
	FOREIGN KEY ("id", "kind")
	REFERENCES "{{database.schema.runtime.name}}"."tb_egress" ("id", "kind")
);

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_egress_webhook" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_egress_webhook" TO "{{database.user.api}}";

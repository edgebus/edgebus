CREATE TABLE "{{database.schema.runtime.name}}"."tb_ingress_websocketclient" (
	"id" INT NOT NULL PRIMARY KEY,
	"kind" "{{database.schema.runtime.name}}"."INGRESS_KIND" NOT NULL,
	"url" VARCHAR(2048) NOT NULL,

	CONSTRAINT "ck__kind"
	CHECK ("kind" = 'WEB_SOCKET_CLIENT'),
	
	CONSTRAINT "fk__tb_ingress_httphost__tb_ingress"
	FOREIGN KEY ("id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_ingress" ("id"),

	CONSTRAINT "fk__tb_ingress_httphost__tb_ingress__integrity"
	FOREIGN KEY ("id", "kind")
	REFERENCES "{{database.schema.runtime.name}}"."tb_ingress" ("id", "kind")
);

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_ingress_websocketclient" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_ingress_websocketclient" TO "{{database.user.api}}";

CREATE TABLE "{{database.schema.runtime.name}}"."tb_egress_websocket_host" (
	"id" INT NOT NULL,
	"kind" "{{database.schema.runtime.name}}"."EGRESS_KIND" NOT NULL,

	CONSTRAINT "pk__tb_egress_websocket_host"
	PRIMARY KEY ("id"),

	CONSTRAINT "ck__tb_egress_websocket_host__kind"
	CHECK ("kind" = 'WEB_SOCKET_HOST'),
	
	CONSTRAINT "fk__tb_egress_websocket_host__tb_egress"
	FOREIGN KEY ("id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_egress" ("id"),

	CONSTRAINT "fk__tb_egress_websocket_host__tb_ingress__integrity"
	FOREIGN KEY ("id", "kind")
	REFERENCES "{{database.schema.runtime.name}}"."tb_egress" ("id", "kind")
);

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_egress_websocket_host" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_egress_websocket_host" TO "{{database.user.api}}";

CREATE TABLE "{{database.schema.runtime.name}}"."tb_egress_topic" (
	"id" SERIAL NOT NULL,
	"egress_id" INT NOT NULL,
	"topic_id" INT NOT NULL,
	"utc_created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_deleted_date" TIMESTAMP WITHOUT TIME ZONE NULL,

	CONSTRAINT "pk__tb_egress_topic"
	PRIMARY KEY ("id"),

	CONSTRAINT "fk__tb_egress_topic__tb_egress"
	FOREIGN KEY ("egress_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_egress" ("id"),

	CONSTRAINT "fk__tb_egress_topic__tb_topic"
	FOREIGN KEY ("topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_topic" ("id")
);

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_egress_topic" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_egress_topic" TO "{{database.user.api}}";
GRANT UPDATE ("utc_deleted_date") ON "{{database.schema.runtime.name}}"."tb_egress_topic" to "{{database.user.api}}";

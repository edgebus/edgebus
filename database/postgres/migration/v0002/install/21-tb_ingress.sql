CREATE TABLE "{{database.schema.runtime.name}}"."tb_ingress" (
	"id" SERIAL NOT NULL,
	"kind" "{{database.schema.runtime.name}}"."INGRESS_KIND" NOT NULL,
	"api_uuid" UUID NOT NULL,
	"topic_id" INT NOT NULL,
	"utc_created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_deleted_date" TIMESTAMP WITHOUT TIME ZONE NULL,

	CONSTRAINT "pk__tb_ingress"
	PRIMARY KEY ("id"),

	CONSTRAINT "pk__tb_ingress__kind__integrity"
	UNIQUE ("id", "kind"),

	CONSTRAINT "pk__tb_ingress__topic__integrity"
	UNIQUE ("id", "topic_id"),

	CONSTRAINT "uq__tb_ingress__api_uuid"
	UNIQUE ("api_uuid"),

	CONSTRAINT "fk__tb_ingress__tb_topic"
	FOREIGN KEY ("topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_topic" ("id")
);

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_ingress" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_ingress" TO "{{database.user.api}}";
GRANT UPDATE ("utc_deleted_date") ON "{{database.schema.runtime.name}}"."tb_ingress" to "{{database.user.api}}";

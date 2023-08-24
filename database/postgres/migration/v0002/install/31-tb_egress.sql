CREATE TABLE "{{database.schema.runtime.name}}"."tb_egress" (
	"id" SERIAL NOT NULL,
	"kind" "{{database.schema.runtime.name}}"."EGRESS_KIND" NOT NULL,
	"name" VARCHAR(256) NOT NULL,
	"api_uuid" UUID NOT NULL,
	"filter_label_policy" VARCHAR(6) NOT NULL,
	"utc_created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_deleted_date" TIMESTAMP WITHOUT TIME ZONE NULL,

	CONSTRAINT "pk__tb_egress"
	PRIMARY KEY ("id"),

	CONSTRAINT "pk__tb_egress__kind__integrity"
	UNIQUE ("id", "kind"),

	CONSTRAINT "uq__tb_egress__api_uuid"
	UNIQUE ("api_uuid"),

	CONSTRAINT "ck__filter_label_policy"
	CHECK ("filter_label_policy" IN ('strict', 'lax', 'skip', 'ignore'))
);


GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_egress" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_egress" TO "{{database.user.api}}";
GRANT UPDATE ("utc_deleted_date") ON "{{database.schema.runtime.name}}"."tb_egress" to "{{database.user.api}}";

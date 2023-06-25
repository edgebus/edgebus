CREATE TABLE "{{database.schema.runtime.name}}"."tb_label" (
	"id" SERIAL NOT NULL,
	"api_uuid" UUID NOT NULL,
	"value" VARCHAR(32),
	"utc_created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_deleted_date" TIMESTAMP WITHOUT TIME ZONE NULL,

	CONSTRAINT "pk__tb_label"
	PRIMARY KEY ("id"),

	CONSTRAINT "uq__tb_label__api_uuid"
	UNIQUE ("api_uuid")
);

CREATE UNIQUE INDEX "uq__tb_label__value"
ON "{{database.schema.runtime.name}}"."tb_label" ("value")
WHERE "utc_deleted_date" IS NULL;

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_label" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_label" TO "{{database.user.api}}";
GRANT UPDATE ("utc_deleted_date") ON "{{database.schema.runtime.name}}"."tb_label" to "{{database.user.api}}";

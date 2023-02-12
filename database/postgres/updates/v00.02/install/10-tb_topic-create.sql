CREATE TABLE "{{database.schema.runtime.name}}"."tb_topic" (
	"id" SERIAL NOT NULL PRIMARY KEY,
	"domain" VARCHAR(256) NULL,
	"name" VARCHAR(256) NOT NULL,
	"description" VARCHAR(1028) NOT NULL,
	"media_type" VARCHAR(128) NOT NULL,
	"utc_created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_deleted_date" TIMESTAMP WITHOUT TIME ZONE NULL
);

CREATE UNIQUE INDEX "uq__tb_topic__doman_name" 
ON "{{database.schema.runtime.name}}"."tb_topic" ("domain", "name")
WHERE "domain" IS NOT NULL;

CREATE UNIQUE INDEX "uq__tb_topic__name"
ON "{{database.schema.runtime.name}}"."tb_topic" ("name")
WHERE "domain" IS NULL;

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_topic" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_topic" TO "{{database.user.api}}";
GRANT UPDATE ("utc_deleted_date") ON "{{database.schema.runtime.name}}"."tb_topic" to "{{database.user.api}}";

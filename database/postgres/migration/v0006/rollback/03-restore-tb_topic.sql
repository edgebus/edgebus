ALTER TABLE "{{database.schema.runtime.name}}"."tb_topic"
	DROP CONSTRAINT "ck__topic__kind";

ALTER TABLE "{{database.schema.runtime.name}}"."tb_topic"
	DROP COLUMN "kind";

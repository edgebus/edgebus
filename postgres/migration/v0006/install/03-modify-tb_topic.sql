ALTER TABLE "{{database.schema.runtime.name}}"."tb_topic"
	ADD COLUMN "kind" VARCHAR(32);

ALTER TABLE "{{database.schema.runtime.name}}"."tb_topic"
	ADD CONSTRAINT "ck__topic__kind"
	CHECK ("kind" IN ('ASYNCHRONOUS', 'SYNCHRONOUS'));

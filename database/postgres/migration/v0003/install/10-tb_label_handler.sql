CREATE TABLE "{{database.schema.runtime.name}}"."tb_label_handler" (
	"id" SERIAL NOT NULL,
	"api_uuid" UUID NOT NULL,
	"kind" "{{database.schema.runtime.name}}"."LABEL_HANDLER_KIND" NOT NULL,
	"topic_id" INT NOT NULL,
	"utc_created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_deleted_date" TIMESTAMP WITHOUT TIME ZONE NULL,

	CONSTRAINT "pk__tb_label_handler"
	PRIMARY KEY ("id"),

	CONSTRAINT "fk__tb_message_label__tb_topic"
	FOREIGN KEY ("topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_topic" ("id"),

	CONSTRAINT "uq__tb_label_handler__api_uuid"
	UNIQUE ("api_uuid")
);

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_label_handler" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_label_handler" TO "{{database.user.api}}";
GRANT UPDATE ("utc_deleted_date") ON "{{database.schema.runtime.name}}"."tb_label_handler" to "{{database.user.api}}";

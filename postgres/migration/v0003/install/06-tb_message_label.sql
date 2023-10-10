CREATE TABLE "{{database.schema.runtime.name}}"."tb_message_label" (
	"label_id" INT NOT NULL,
	"message_id" INT NOT NULL,
	"utc_created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
	"utc_deleted_date" TIMESTAMP WITHOUT TIME ZONE NULL,

	CONSTRAINT "pk__tb_massage_label__integrity"
	UNIQUE ("label_id", "message_id"),

	CONSTRAINT "fk__tb_message_label__tb_message"
	FOREIGN KEY ("message_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_message" ("id"),

	CONSTRAINT "fk__tb_message_label__tb_label"
	FOREIGN KEY ("label_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_label" ("id")
);

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_message_label" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_message_label" TO "{{database.user.api}}";
GRANT UPDATE ("utc_deleted_date") ON "{{database.schema.runtime.name}}"."tb_message_label" to "{{database.user.api}}";

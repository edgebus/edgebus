CREATE TABLE "{{database.schema.runtime.name}}"."tb_label_handler_external_process" (
	"id" INT NOT NULL,
	"path" VARCHAR(2048) NOT NULL,

	CONSTRAINT "pk__tb_label_handler_external_process"
	PRIMARY KEY ("id"),

	CONSTRAINT "uq__tb_label_handler_external_process__tb_label_handler"
	FOREIGN KEY ("id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_label_handler" ("id")
);

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_label_handler_external_process" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_label_handler_external_process" TO "{{database.user.api}}";

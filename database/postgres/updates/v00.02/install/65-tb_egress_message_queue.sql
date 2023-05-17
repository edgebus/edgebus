CREATE TABLE "{{database.schema.runtime.name}}"."tb_egress_message_queue" (
	"id" BIGSERIAL NOT NULL,
	"topic_id" INT NOT NULL,
	"egress_id" INT NOT NULL,
	"message_id" BIGINT NOT NULL,

	CONSTRAINT "pk__tb_egress_message_queue"
	PRIMARY KEY ("id"),

	CONSTRAINT "fk__tb_egress_message_queue__tb_egress"
	FOREIGN KEY ("egress_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_egress" ("id"),

	CONSTRAINT "fk__tb_egress_message_queue__tb_topic"
	FOREIGN KEY ("topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_topic" ("id"),

	CONSTRAINT "fk__tb_egress_message_queue__tb_message"
	FOREIGN KEY ("message_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_message" ("id"),

	CONSTRAINT "fk__tb_egress_message_queue__tb_topic__integrity"
	FOREIGN KEY ("message_id", "topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_message" ("id", "topic_id")
);

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_egress_message_queue" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_egress_message_queue" TO "{{database.user.api}}";
GRANT DELETE ON TABLE "{{database.schema.runtime.name}}"."tb_egress_message_queue" TO "{{database.user.api}}";

CREATE TABLE "{{database.schema.runtime.name}}"."tb_egress_delivery" (
	"id" SERIAL NOT NULL,
	"api_uuid" UUID NOT NULL,
	"egress_id" INT NOT NULL,
	"topic_id" INT NOT NULL,
	"message_id" BIGINT NOT NULL,
	"egress_topic_id" INT NOT NULL,
	"status" "{{database.schema.runtime.name}}"."DELIVERY_STATUS" NOT NULL,
	"success_evidence" JSONB NULL,
	"failure_evidence" JSONB NULL,
	"utc_created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),

	CONSTRAINT "pk__tb_egress_delivery"
	PRIMARY KEY ("id"),

	CONSTRAINT "uq__tb_egress_delivery__api_uuid"
	UNIQUE ("api_uuid"),

	CONSTRAINT "fk__tb_egress_message_queue__tb_egress"
	FOREIGN KEY ("egress_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_egress" ("id"),

	CONSTRAINT "fk__tb_egress_message_queue__tb_egress_topic"
	FOREIGN KEY ("egress_topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_egress_topic" ("id"),

	CONSTRAINT "fk__tb_egress_message_queue__tb_topic"
	FOREIGN KEY ("topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_topic" ("id"),

	CONSTRAINT "fk__tb_egress_message_queue__tb_message"
	FOREIGN KEY ("message_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_message" ("id"),

	CONSTRAINT "fk__tb_egress_delivery__tb_topic__integrity_1"
	FOREIGN KEY ("message_id", "topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_message" ("id", "topic_id"),

	CONSTRAINT "fk__tb_egress_delivery__tb_topic__integrity_2"
	FOREIGN KEY ("egress_topic_id", "egress_id", "topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_egress_topic" ("id", "egress_id", "topic_id")
);

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_egress_delivery" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_egress_delivery" TO "{{database.user.api}}";

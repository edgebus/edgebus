CREATE TABLE "{{database.schema.runtime.name}}"."tb_egress_delivery" (
	"id" SERIAL NOT NULL,
	"api_uuid" UUID NOT NULL,
	"topic_id" INT NOT NULL,
	"message_id" BIGINT NOT NULL,
	"status" "{{database.schema.runtime.name}}"."DELIVERY_STATUS" NOT NULL,
	"success_evidence" JSONB NULL,
	"failure_evidence" JSONB NULL,
	"utc_created_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),

	CONSTRAINT "pk__tb_egress_delivery"
	PRIMARY KEY ("id"),

	CONSTRAINT "uq__tb_egress_delivery__api_uuid"
	UNIQUE ("api_uuid"),

	CONSTRAINT "ck__tb_egress_delivery__evidence"
	CHECK (("status" = 'SUCCESS' AND "success_evidence" IS NOT NULL) OR ("status" = 'FAILURE' AND "failure_evidence" IS NOT NULL)),

	CONSTRAINT "fk__tb_egress_message_queue__tb_topic"
	FOREIGN KEY ("topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_topic" ("id"),

	CONSTRAINT "fk__tb_egress_message_queue__tb_message"
	FOREIGN KEY ("message_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_message" ("id"),

	CONSTRAINT "fk__tb_egress_delivery__tb_topic__integrity"
	FOREIGN KEY ("message_id", "topic_id")
	REFERENCES "{{database.schema.runtime.name}}"."tb_message" ("id", "topic_id")
);

CREATE UNIQUE INDEX "uq__tb_egress_delivery__success"
ON "{{database.schema.runtime.name}}"."tb_egress_delivery" ("message_id", "topic_id")
WHERE "status" = 'SUCCESS';

GRANT INSERT ON TABLE "{{database.schema.runtime.name}}"."tb_egress_delivery" TO "{{database.user.api}}";
GRANT SELECT ON TABLE "{{database.schema.runtime.name}}"."tb_egress_delivery" TO "{{database.user.api}}";

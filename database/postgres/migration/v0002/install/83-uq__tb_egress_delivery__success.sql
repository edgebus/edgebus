CREATE UNIQUE INDEX "uq__tb_egress_delivery__success"
ON "{{database.schema.runtime.name}}"."tb_egress_delivery" ("message_id", "egress_id")
WHERE "status" = 'SUCCESS';

COMMENT ON INDEX "{{database.schema.runtime.name}}"."uq__tb_egress_delivery__success"
IS 'Only one success message for an egress.';

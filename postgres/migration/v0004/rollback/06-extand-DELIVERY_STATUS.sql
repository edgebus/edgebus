ALTER TYPE "{{database.schema.runtime.name}}"."DELIVERY_STATUS" RENAME TO "DELIVERY_STATUS_OLD";
CREATE TYPE "{{database.schema.runtime.name}}"."DELIVERY_STATUS" AS ENUM('SUCCESS', 'FAILURE');
ALTER TABLE "{{database.schema.runtime.name}}"."tb_egress_delivery" 
	ALTER COLUMN "status" TYPE "{{database.schema.runtime.name}}"."DELIVERY_STATUS"
	USING ("status"::TEXT::"{{database.schema.runtime.name}}"."DELIVERY_STATUS");
DROP TYPE "{{database.schema.runtime.name}}"."DELIVERY_STATUS_OLD";

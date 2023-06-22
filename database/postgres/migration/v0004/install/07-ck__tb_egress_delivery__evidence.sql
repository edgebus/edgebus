ALTER TABLE "{{database.schema.runtime.name}}"."tb_egress_delivery"
	ADD CONSTRAINT "ck__tb_egress_delivery__evidence"
	CHECK (
		("status" = 'SUCCESS' AND "success_evidence" IS NOT NULL AND "failure_evidence" IS NULL) 
		OR ("status" = 'FAILURE' AND "failure_evidence" IS NOT NULL AND "success_evidence" IS NULL)
		OR ("status" = 'SKIP' AND "success_evidence" IS NULL AND "failure_evidence" IS NULL)
	);
 
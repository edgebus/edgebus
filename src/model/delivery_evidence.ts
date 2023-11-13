import { Egress } from "./egress";

export namespace DeliveryEvidence {
	export interface Data {
		readonly kind: Egress.Kind;
		readonly headers: Record<string, string>;
		readonly body: string;
		readonly bodyJson: Record<string, unknown>;
		readonly statusCode: number;
		readonly statusDescription: string;
	}
}

export type DeliveryEvidence = DeliveryEvidence.Data;


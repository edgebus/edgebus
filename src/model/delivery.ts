import { DeliveryIdentifier, EgressIdentifier, MessageIdentifier, TopicIdentifier } from "./identifiers";

export namespace Delivery {
	export const enum Status {
		Success = "SUCCESS",
		Failure = "FAILURE",
		Skip = "SKIP"
	}

	export interface Id {
		readonly deliveryId: DeliveryIdentifier;
	}
	export type Data =
		| Data.Success
		| Data.Failure
		| Data.Skip;
	export namespace Data {
		export interface Base {
			readonly egressId: EgressIdentifier;
			readonly topicId: TopicIdentifier;
			readonly messageId: MessageIdentifier;
			readonly status: Status;
		}
		export interface Success extends Base {
			readonly status: Status.Success;
			readonly successEvidence: any;
		}
		export interface Failure extends Base {
			readonly status: Status.Failure;
			readonly failure_evidence: any;
		}
		export interface Skip extends Base {
			readonly status: Status.Skip;
		}
	}

	export interface Instance {
		readonly deliverCreatedAt: Date;
	}
}

export type Delivery =
	& Delivery.Id
	& Delivery.Data
	& Delivery.Instance;

import { MessageApiIdentifier } from "../misc/api-identifier";

export namespace Message {
	export interface Id {
		/**
		 * An identifier of the `Message`
		 */
		readonly messageId: MessageApiIdentifier;
	}

	export type Headers = Readonly<Record<string, string>>;

	export interface Data {
		readonly headers: Headers;
		/**
		 * https://en.wikipedia.org/wiki/Media_type
		 */
		readonly mediaType: string;
		/**
		 * Binary data of the ingress(original) message
		 */
		readonly ingressBody: Uint8Array;
		/**
		 * Binary data of the transformed message
		 */
		readonly transformedBody: Uint8Array;
	}

	export interface StatusBase {
		readonly deliveryAttemptsCount: number;
	}
	export interface StatusNew extends StatusBase {
		readonly status: Status.Kind.NEW;
	}
	export interface StatusOnTheWay extends StatusBase {
		readonly status: Status.Kind.ON_THE_WAY;

		readonly latestDeliveryErrorMessage: string | null;
	}
	export interface StatusCancelled extends StatusBase {
		readonly status: Status.Kind.CANCELLED;

		readonly cancelDate: Date;
	}
	export interface StatusDelivered extends StatusBase {
		readonly status: Status.Kind.DELIVERED;

		readonly deliveryDate: Date;
	}
	export interface StatusRejected extends StatusBase {
		readonly status: Status.Kind.REJECTED;

		readonly rejectDate: Date;
	}
	export type Status = StatusNew | StatusOnTheWay | StatusCancelled | StatusDelivered | StatusRejected;
	export namespace Status {
		export const enum Kind {
			NEW = "NEW",
			ON_THE_WAY = "ON_THE_WAY",
			CANCELLED = "CANCELLED",
			DELIVERED = "DELIVERED",
			REJECTED = "REJECTED"
		}
	}
}

export type Message = Message.Id & Message.Data & Message.Status;

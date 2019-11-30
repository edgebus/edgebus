export namespace Message {
	/**
	 * The ID of the `Message`
	 */
	export interface Id {
		readonly messageId: string;
	}

	export interface Data {
		/**
		 * https://en.wikipedia.org/wiki/Media_type
		 */
		readonly mediaType: string;
		/**
		 * Binary data of the message
		 */
		readonly body: Buffer;
		/**
		 * Publisher's signature over body
		 */
		readonly signature: Buffer;
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

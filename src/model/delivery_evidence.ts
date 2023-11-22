import { Egress } from "./egress";

export namespace DeliveryEvidence {
	export enum Type {
		Success,
		Failed
	}

	export interface WebhookData {
		readonly kind: Egress.Kind.Webhook;
		readonly headers: Record<string, string>;
		readonly body: string;
		readonly bodyJson: Record<string, unknown>;
		readonly statusCode: number;
		readonly statusDescription: string;
	}

	export interface WebsocketData {
		readonly kind: Egress.Kind.WebSocketHost;
	}

	export interface TelegramData {
		readonly kind: Egress.Kind.Telegram;
	}

	export type SuccessData = WebhookData | WebsocketData | TelegramData;

	export interface SuccessDeliveryEvidence {
		readonly type: DeliveryEvidence.Type.Success;
		readonly data: DeliveryEvidence.SuccessData;
	}

	export interface FailedDeliveryEvidence {
		readonly type: DeliveryEvidence.Type.Failed;
		readonly data: string;
	}
}

export type DeliveryEvidence = DeliveryEvidence.SuccessDeliveryEvidence | DeliveryEvidence.FailedDeliveryEvidence;

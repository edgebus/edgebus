import { FExceptionArgument } from "@freemework/common";

import { v4 as uuidV4 } from "uuid";

export const enum ApiIdentifierPrefix {
	DELIVERY = "DLVR",
	MESSAGE = "MSSG",
	TOPIC = "TOPC",
	INGRESS = "PUBR",
	EGRESS = "SUBR"
}

export abstract class ApiIdentifier {
	public abstract get prefix(): ApiIdentifierPrefix;
	public get value() {
		const value = this.uuid.split("-").join("");
		return `${this.prefix}${value}`;
	}
	public get uuid() { return this._uuid; }

	public valueOf(): Object { return this.value; }
	public toJSON(): string { return this.value; }
	public toString(): string { return this.value; }

	public static parse(apiId: string): ApiIdentifier {
		const [prefix, uuid] = ApiIdentifier.parseIdentifierParts(apiId);
		switch (prefix) {
			case ApiIdentifierPrefix.EGRESS: return MessageApiIdentifier.fromUuid(uuid);
			case ApiIdentifierPrefix.INGRESS: return MessageApiIdentifier.fromUuid(uuid);
			case ApiIdentifierPrefix.MESSAGE: return MessageApiIdentifier.fromUuid(uuid);
			case ApiIdentifierPrefix.TOPIC: return MessageApiIdentifier.fromUuid(uuid);
			default: throw new FExceptionArgument(`Wrong apiId value: ${apiId}. Unexpected prefix: ${prefix}`, "apiId");
		}
	}
	/** 
	 * Parse the an EdgeBus API identifier parts.
	 */
	protected static parseIdentifierParts(apiId: string): [string, string] {
		if (apiId.length != 36) {
			throw new FExceptionArgument(`Wrong apiId value: ${apiId}. Expected 36 symbols`, "apiId");
		}

		const prefix: string = apiId.substring(0, 4);

		const uuidHexStr: string = apiId.substring(4);
		const buffer: Buffer = Buffer.from(uuidHexStr, "hex");
		if (buffer.length !== 16) {
			throw new FExceptionArgument("apiId", `Wrong apiId value: ${apiId}. Expected 16 bytes hex-string`);
		}

		const g0 = buffer.subarray(0, 4).toString("hex");
		const g1 = buffer.subarray(4, 6).toString("hex");
		const g2 = buffer.subarray(6, 8).toString("hex");
		const g3 = buffer.subarray(8, 10).toString("hex");
		const g4 = buffer.subarray(10, 16).toString("hex");


		const uuidStr: string = `${g0}-${g1}-${g2}-${g3}-${g4}`

		return [prefix, uuidStr];
	}
	public constructor(uuid?: string) {
		this._uuid = uuid ?? uuidV4();
	}

	private readonly _uuid: string;
}



export class DeliveryApiIdentifier extends ApiIdentifier {
	public static parse(apiId: string): DeliveryApiIdentifier {
		const [prefix, uuid] = ApiIdentifier.parseIdentifierParts(apiId);
		if (prefix !== ApiIdentifierPrefix.DELIVERY) {
			throw new FExceptionArgument(
				`Bad Delivery API identifier '${apiId}'. Expected prefix '${ApiIdentifierPrefix.DELIVERY}', but got '${prefix}'.`,
				"apiId"
			);
		}
		return new DeliveryApiIdentifier(uuid);
	}

	public static fromUuid(uuid: string): DeliveryApiIdentifier { return new DeliveryApiIdentifier(uuid); }
	public get prefix(): ApiIdentifierPrefix.DELIVERY { return ApiIdentifierPrefix.DELIVERY; }
}

export class MessageApiIdentifier extends ApiIdentifier {
	public static parse(apiId: string): MessageApiIdentifier {
		const [prefix, uuid] = ApiIdentifier.parseIdentifierParts(apiId);
		if (prefix !== ApiIdentifierPrefix.MESSAGE) {
			throw new FExceptionArgument(
				`Bad Message API identifier '${apiId}'. Expected prefix '${ApiIdentifierPrefix.MESSAGE}', but got '${prefix}'.`,
				"apiId"
			);
		}
		return new MessageApiIdentifier(uuid);
	}

	public static fromUuid(uuid: string): MessageApiIdentifier { return new MessageApiIdentifier(uuid); }
	public get prefix(): ApiIdentifierPrefix.MESSAGE { return ApiIdentifierPrefix.MESSAGE; }
}

export class TopicApiIdentifier extends ApiIdentifier {
	public static parse(apiId: string): TopicApiIdentifier {
		const [prefix, uuid] = ApiIdentifier.parseIdentifierParts(apiId);
		if (prefix !== ApiIdentifierPrefix.TOPIC) {
			throw new FExceptionArgument(
				`Bad Topic API identifier '${apiId}'. Expected prefix '${ApiIdentifierPrefix.TOPIC}', but got '${prefix}'.`,
				"apiId"
			);
		}
		return new TopicApiIdentifier(uuid);
	}

	public static fromUuid(uuid: string): TopicApiIdentifier { return new TopicApiIdentifier(uuid); }
	public get prefix(): ApiIdentifierPrefix.TOPIC { return ApiIdentifierPrefix.TOPIC; }
}

export class IngressApiIdentifier extends ApiIdentifier {
	public static parse(apiId: string): IngressApiIdentifier {
		const [prefix, uuid] = ApiIdentifier.parseIdentifierParts(apiId);
		if (prefix !== ApiIdentifierPrefix.INGRESS) {
			throw new FExceptionArgument(
				`Bad Ingress API identifier '${apiId}'. Expected prefix '${ApiIdentifierPrefix.INGRESS}', but got '${prefix}'.`,
				"apiId"
			);
		}
		return new IngressApiIdentifier(uuid);
	}

	public static fromUuid(uuid: string): IngressApiIdentifier { return new IngressApiIdentifier(uuid); }
	public get prefix(): ApiIdentifierPrefix.INGRESS { return ApiIdentifierPrefix.INGRESS; }
}

export class EgressApiIdentifier extends ApiIdentifier {
	public static parse(apiId: string): EgressApiIdentifier {
		const [prefix, uuid] = ApiIdentifier.parseIdentifierParts(apiId);
		if (prefix !== ApiIdentifierPrefix.EGRESS) {
			throw new FExceptionArgument(
				`Bad Egress API identifier '${apiId}'. Expected prefix '${ApiIdentifierPrefix.EGRESS}', but got '${prefix}'.`,
				"apiId"
			);
		}
		return new EgressApiIdentifier(uuid);
	}

	public static fromUuid(uuid: string): EgressApiIdentifier { return new EgressApiIdentifier(uuid); }
	public get prefix(): ApiIdentifierPrefix.EGRESS { return ApiIdentifierPrefix.EGRESS; }
}

import { FExceptionArgument } from "@freemework/common";

/**
 * Represents an API identifier of an EdgeBus resource.
 */
export abstract class ApiIdentifier {
	/**
	 * Get string representation of the identifier
	 */
	public get value(): string {
		const value = this._uuid.split("-").join("");
		return `${this.prefix}${value}`;
	}

	/**
	 * Get UUID representation of the identifier
	 */
	public get uuid() { return this._uuid; }

	public toString(): string { return this.constructor.name + " [" + this.value + "]"; }

	public toJSON(): any { return this.value; }

	/** 
	 * Parse the an EdgeBus API identifier parts.
	 */
	protected static parseIdentifierParts(apiId: string): [string, string] {
		if (apiId.length != 36) {
			throw new FExceptionArgument(`Unparsable API identifier '{apiId}'`, "apiId");
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

	protected abstract get prefix(): string;

	protected constructor(uuid: string) {
		this._uuid = uuid;
	}

	private readonly _uuid: string;
}

/**
 * Represents an unique identifier of EdgeBus Delivery.
 */
export class DeliveryApiIdentifier extends ApiIdentifier {
	/**
	 * The identifier starts with 'DLVR' that stands of EdgeBus Delivery.
	 */
	private static readonly PREFIX: string = "DLVR";

	/**
	 * 
	 */
	protected get prefix(): string { return DeliveryApiIdentifier.PREFIX; };

	/** 
	 * Parse the a EdgeBus Delivery identifier.
	 */
	public static parse(apiId: string): DeliveryApiIdentifier {
		const [prefix, uuidStr] = ApiIdentifier.parseIdentifierParts(apiId);

		if (prefix !== DeliveryApiIdentifier.PREFIX) {
			throw new FExceptionArgument(
				`Bad Delivery API identifier '${apiId}'. Expected prefix '${DeliveryApiIdentifier.PREFIX}', but got '${prefix}'.`,
				"apiId"
			);
		}

		return new DeliveryApiIdentifier(uuidStr);
	}

	private constructor(uuid: string) { super(uuid); }
}

/**
 * Represents an unique identifier of EdgeBus Message.
 */
export class MessageApiIdentifier extends ApiIdentifier {
	/**
	 * The identifier starts with 'MSSG' that stands of EdgeBus Message.
	 */
	private static readonly PREFIX: string = "MSSG";

	/**
	 * 
	 */
	protected get prefix(): string { return MessageApiIdentifier.PREFIX; };

	/** 
	 * Parse the a EdgeBus Delivery identifier.
	 */
	public static parse(apiId: string): MessageApiIdentifier {
		const [prefix, uuidStr] = ApiIdentifier.parseIdentifierParts(apiId);

		if (prefix !== MessageApiIdentifier.PREFIX) {
			throw new FExceptionArgument(
				`Bad Delivery API identifier '${apiId}'. Expected prefix '${MessageApiIdentifier.PREFIX}', but got '${prefix}'.`,
				"apiId"
			);
		}

		return new MessageApiIdentifier(uuidStr);
	}

	private constructor(uuid: string) { super(uuid); }
}

/**
 * Represents an unique identifier of EdgeBus Publisher.
 */
export class PublisherApiIdentifier extends ApiIdentifier {
	/**
	 * The identifier starts with 'PUBR' that stands of EdgeBus Publisher.
	 */
	private static readonly PREFIX: string = "PUBR";

	/**
	 * 
	 */
	protected get prefix(): string { return PublisherApiIdentifier.PREFIX; };

	/** 
	 * Parse the a EdgeBus Publisher identifier.
	 */
	public static parse(apiId: string): PublisherApiIdentifier {
		const [prefix, uuidStr] = ApiIdentifier.parseIdentifierParts(apiId);

		if (prefix !== PublisherApiIdentifier.PREFIX) {
			throw new FExceptionArgument(
				`Bad Publisher API identifier '${apiId}'. Expected prefix '${PublisherApiIdentifier.PREFIX}', but got '${prefix}'.`,
				"apiId"
			);
		}

		return new PublisherApiIdentifier(uuidStr);
	}

	private constructor(uuid: string) { super(uuid); }
}

/**
 * Represents an unique identifier of EdgeBus Subscriber.
 */
export class SubscriberApiIdentifier extends ApiIdentifier {
	/**
	 * The identifier starts with 'SUBR' that stands of EdgeBus Subscriber.
	 */
	private static readonly PREFIX: string = "SUBR";

	/**
	 * 
	 */
	protected get prefix(): string { return SubscriberApiIdentifier.PREFIX; };

	/** 
	 * Parse the a EdgeBus Subscriber identifier.
	 */
	public static parse(apiId: string): SubscriberApiIdentifier {
		const [prefix, uuidStr] = ApiIdentifier.parseIdentifierParts(apiId);

		if (prefix !== SubscriberApiIdentifier.PREFIX) {
			throw new FExceptionArgument(
				`Bad Delivery API identifier '${apiId}'. Expected prefix '${SubscriberApiIdentifier.PREFIX}', but got '${prefix}'.`,
				"apiId"
			);
		}

		return new SubscriberApiIdentifier(uuidStr);
	}

	private constructor(uuid: string) { super(uuid); }
}

/**
 * Represents an unique identifier of EdgeBus Topic.
 */
export class TopicApiIdentifier extends ApiIdentifier {
	/**
	 * The identifier starts with 'DLVR' that stands of EdgeBus Topic.
	 */
	private static readonly PREFIX: string = "DLVR";

	/**
	 * 
	 */
	protected get prefix(): string { return TopicApiIdentifier.PREFIX; };

	/** 
	 * Parse the a EdgeBus Topic identifier.
	 */
	public static parse(apiId: string): TopicApiIdentifier {
		const [prefix, uuidStr] = ApiIdentifier.parseIdentifierParts(apiId);

		if (prefix !== TopicApiIdentifier.PREFIX) {
			throw new FExceptionArgument(
				`Bad Delivery API identifier '${apiId}'. Expected prefix '${TopicApiIdentifier.PREFIX}', but got '${prefix}'.`,
				"apiId"
			);
		}

		return new TopicApiIdentifier(uuidStr);
	}

	private constructor(uuid: string) { super(uuid); }
}

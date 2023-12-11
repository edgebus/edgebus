import { FExceptionArgument, FExceptionInvalidOperation } from "@freemework/common";

import { v4 as uuidV4 } from "uuid";

export const enum IdentifierPrefix {
	DELIVERY = "DLVR",
	MESSAGE = "MSSG",
	TOPIC = "TOPC",
	INGRESS = "IGRS",
	EGRESS = "EGRS",
	LABEL = "LBEL",
	LABEL_HANDLER = "LBHD"
}

/**
 * Base class for model's identifier
 * 
 * We want to use script equality between identifiers to use it as key in native Set and Map.
 * JS does not provide possibility to implement object equality (to be used in native Set, Map, etc.)
 * Our solution is identifier objects cache to provide unique id object by uuid.
 *
 * Another possible implementation (for future refactoring) may be based on proposal-record-tuple
 * See https://tc39.es/proposal-record-tuple/
 * 
 * @example
 * const someMap = new Map();
 * const id: Identifier = ResourceIdentifier.parse(req.body.resourceId);
 * someMap.set(id, "some data keyed by id");
 * ...
 * // later
 * const id: Identifier = ResourceIdentifier.parse(req.body.resourceId);
 * const data = someMap.get(id); // data = "some data keyed by id"
 * 
 * @example
 * //
 * // Recommended implementation of identifier
 * //
 * export abstract class MyIdentifier extends Identifier {
 *    public static generate(): MyIdentifier { return new MyIdentifierImpl(); }
 *    public static fromUuid(uuid: string): MyIdentifier { return Identifier.create(MyIdentifierImpl, uuid); }
 *    public static parse(id: string): MyIdentifier { return Identifier.create(MyIdentifierImpl, Identifier.parseIdentifierUuid(id, IdentifierPrefix.MY)); }
 *    public get prefix(): IdentifierPrefix.MY { return IdentifierPrefix.MY; }
 *}
 * class MyIdentifierImpl extends MyIdentifier {
 *    public constructor(uuid?: string) { super(uuid); }
 * }
 */
export abstract class Identifier {
	public abstract get prefix(): IdentifierPrefix;
	public get value(): string {
		const value: string = this.uuid.split("-").join("");
		return `${this.prefix}${value}`;
	}
	public get uuid(): string { return this._uuid; }
	public toJSON(): string { return this.value; }
	public toString(): string { return this.value; }

	protected static create<T extends Identifier>(identifierCls: Function & { new(uuid?: string): T; prototype: T; }, uuid?: string): T {
		const instanceUuid = uuid ?? uuidV4();
		const ref: WeakRef<Identifier> | undefined = Identifier._weakRefIds.get(instanceUuid);
		if (ref !== undefined) {
			const existingInstance = ref.deref();
			if (existingInstance !== undefined) {
				return existingInstance as T;
			} else {
				Identifier._weakRefIds.delete(instanceUuid);
			}
		}


		return new identifierCls(instanceUuid);
	}
	protected static parseIdentifierUuid(id: string, expectedPrefix: IdentifierPrefix): Identifier["uuid"] {
		if (id.length !== 36) {
			throw new FExceptionArgument(`Wrong id value: ${id}. Expected 36 symbols`, "id");
		}

		const prefix: string = id.substring(0, 4);

		if (expectedPrefix !== prefix) {
			throw new FExceptionArgument(
				`Bad identifier '${id}'. Expected prefix '${expectedPrefix}', but got '${prefix}'.`,
				"id"
			);
		}

		const uuidHexStr: string = id.substring(4);
		const buffer: Buffer = Buffer.from(uuidHexStr, "hex");
		if (buffer.length !== 16) {
			throw new FExceptionArgument("id", `Wrong id value: ${id}. Expected 16 bytes hex-string`);
		}

		const g0 = buffer.subarray(0, 4).toString("hex");
		const g1 = buffer.subarray(4, 6).toString("hex");
		const g2 = buffer.subarray(6, 8).toString("hex");
		const g3 = buffer.subarray(8, 10).toString("hex");
		const g4 = buffer.subarray(10, 16).toString("hex");

		const uuidStr: string = `${g0}-${g1}-${g2}-${g3}-${g4}`

		return uuidStr;
	}

	protected constructor(uuid?: string) {
		Identifier.cleanup(); // Cleanup weak reference

		this._uuid = uuid ?? uuidV4();
		if (Identifier._weakRefIds.has(this._uuid)) {
			throw new FExceptionInvalidOperation("Internal violation. Contact to developers of the class.");
		}
		Identifier._weakRefIds.set(this._uuid, new WeakRef(this));
	}

	private static cleanup(): void {
		let releasedIdsCount: number = 0;
		for (const [uuid, idRef] of Identifier._weakRefIds.entries()) {
			const id: Identifier | undefined = idRef.deref();
			if (id !== undefined) {
				// This id is used, move next...
				continue;
			}

			Identifier._weakRefIds.delete(uuid); // cleanup

			if (++releasedIdsCount === 2) {
				// Prevent high load.
				// To make O(1) we just cleanup first 2 ids.
				// It is enough to prevent growing _weakRefIds
				return;
			}
		}
	}

	private readonly _uuid: string;
	private static readonly _weakRefIds: Map<Identifier["uuid"], WeakRef<Identifier>> = new Map();
}

export abstract class DeliveryIdentifier extends Identifier {
	public static generate(): DeliveryIdentifier { return new DeliveryIdentifierImpl(); }
	public static fromUuid(uuid: string): DeliveryIdentifier { return Identifier.create(DeliveryIdentifierImpl, uuid); }
	public static parse(id: string): DeliveryIdentifier { return Identifier.create(DeliveryIdentifierImpl, Identifier.parseIdentifierUuid(id, IdentifierPrefix.DELIVERY)); }
	public get prefix(): IdentifierPrefix.DELIVERY { return IdentifierPrefix.DELIVERY; }
}
class DeliveryIdentifierImpl extends DeliveryIdentifier {
	public constructor(uuid?: string) { super(uuid); }
}

export abstract class EgressIdentifier extends Identifier {
	public static generate(): EgressIdentifier { return new EgressIdentifierImpl(); }
	public static fromUuid(uuid: string): EgressIdentifier { return Identifier.create(EgressIdentifierImpl, uuid); }
	public static parse(id: string): EgressIdentifier { return Identifier.create(EgressIdentifierImpl, Identifier.parseIdentifierUuid(id, IdentifierPrefix.EGRESS)); }
	public get prefix(): IdentifierPrefix.EGRESS { return IdentifierPrefix.EGRESS; }
}
class EgressIdentifierImpl extends EgressIdentifier {
	public constructor(uuid?: string) { super(uuid); }
}

export abstract class IngressIdentifier extends Identifier {
	public static generate(): IngressIdentifier { return new IngressIdentifierImpl(); }
	public static fromUuid(uuid: string): IngressIdentifier { return Identifier.create(IngressIdentifierImpl, uuid); }
	public static parse(id: string): IngressIdentifier { return Identifier.create(IngressIdentifierImpl, Identifier.parseIdentifierUuid(id, IdentifierPrefix.INGRESS)); }
	public get prefix(): IdentifierPrefix.INGRESS { return IdentifierPrefix.INGRESS; }
}
class IngressIdentifierImpl extends IngressIdentifier {
	public constructor(uuid?: string) { super(uuid); }
}

export class LabelHandlerIdentifier extends Identifier {
	public static generate(): LabelHandlerIdentifier { return new LabelHandlerIdentifierImpl(); }
	public static fromUuid(uuid: string): LabelHandlerIdentifier { return Identifier.create(LabelHandlerIdentifierImpl, uuid); }
	public static parse(id: string): LabelHandlerIdentifier { return Identifier.create(LabelHandlerIdentifierImpl, Identifier.parseIdentifierUuid(id, IdentifierPrefix.LABEL_HANDLER)); }
	public get prefix(): IdentifierPrefix.LABEL_HANDLER { return IdentifierPrefix.LABEL_HANDLER; }
}
class LabelHandlerIdentifierImpl extends LabelHandlerIdentifier {
	public constructor(uuid?: string) { super(uuid); }
}

export class LabelIdentifier extends Identifier {
	public static generate(): LabelIdentifier { return new LabelIdentifierImpl(); }
	public static fromUuid(uuid: string): LabelIdentifier { return Identifier.create(LabelIdentifierImpl, uuid); }
	public static parse(id: string): LabelIdentifier { return Identifier.create(LabelIdentifierImpl, Identifier.parseIdentifierUuid(id, IdentifierPrefix.LABEL)); }
	public get prefix(): IdentifierPrefix.LABEL { return IdentifierPrefix.LABEL; }
}
class LabelIdentifierImpl extends LabelIdentifier {
	public constructor(uuid?: string) { super(uuid); }
}

export abstract class MessageIdentifier extends Identifier {
	public static generate(): MessageIdentifier { return new MessageIdentifierImpl(); }
	public static fromUuid(uuid: string): MessageIdentifier { return Identifier.create(MessageIdentifierImpl, uuid); }
	public static parse(id: string): MessageIdentifier { return Identifier.create(MessageIdentifierImpl, Identifier.parseIdentifierUuid(id, IdentifierPrefix.MESSAGE)); }
	public get prefix(): IdentifierPrefix.MESSAGE { return IdentifierPrefix.MESSAGE; }
}
class MessageIdentifierImpl extends MessageIdentifier {
	public constructor(uuid?: string) { super(uuid); }
}

export abstract class TopicIdentifier extends Identifier {
	public static generate(): TopicIdentifier { return new TopicIdentifierImpl(); }
	public static fromUuid(uuid: string): TopicIdentifier { return Identifier.create(TopicIdentifierImpl, uuid); }
	public static parse(id: string): TopicIdentifier { return Identifier.create(TopicIdentifierImpl, Identifier.parseIdentifierUuid(id, IdentifierPrefix.TOPIC)); }
	public get prefix(): IdentifierPrefix.TOPIC { return IdentifierPrefix.TOPIC; }
}
class TopicIdentifierImpl extends TopicIdentifier {
	public constructor(uuid?: string) { super(uuid); }
}

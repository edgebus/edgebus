import { FExecutionContext, FExecutionContextBase, FExecutionElement } from "@freemework/common";

import { Container } from "typescript-ioc";


export class ProviderLocatorExecutionContext extends FExecutionContextBase {
	public static of(context: FExecutionContext): ProviderLocatorExecutionElement {
		const cancellationExecutionContext: ProviderLocatorExecutionContext =
			FExecutionContext.getExecutionContext(context, ProviderLocatorExecutionContext);

		return new ProviderLocatorExecutionElement(cancellationExecutionContext);
	}

	public get<T>(source: Function & { prototype: T; }): T {
		return ProviderLocator.default.get(source);
	}
}
export class ProviderLocatorExecutionElement<TFExecutionContextCancellation
	extends ProviderLocatorExecutionContext = ProviderLocatorExecutionContext>
	extends FExecutionElement<TFExecutionContextCancellation> {

	public get<T>(source: Function & { prototype: T; }): T {
		return this.owner.get(source);
	}
}

export abstract class ProviderLocator {
	public static get default(): ProviderLocator {
		if (this._default === null) {
			this._default = new ProviderLocatorImpl();
		}
		return this._default;
	}

	public abstract get<T>(source: Function & { prototype: T; }): T;

	private static _default: ProviderLocator | null = null;
}

class ProviderLocatorImpl extends ProviderLocator {
	public get<T>(source: Function & { prototype: T; }): T {
		return Container.get(source);
	}
}

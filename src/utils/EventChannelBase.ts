import { FCancellationToken, FDisposableBase, FException, FExecutionContext, FInitableBase, FChannelEvent, FChannelEventMixin } from "@freemework/common";
import { FCancellationException, FExceptionAggregate, FExceptionInvalidOperation } from "@freemework/common";

export abstract class EventChannelBase<TData, TEvent extends FChannelEvent.Event<TData> = FChannelEvent.Event<TData>>
	extends FInitableBase implements FChannelEvent<TData, TEvent> {
	private readonly _callbacks: Array<FChannelEvent.Callback<TData, TEvent>>;

	public constructor() {
		super();
		this._callbacks = [];
	}

	public addHandler(cb: FChannelEvent.Callback<TData, TEvent>): void {
		this._callbacks.push(cb);
		if (this._callbacks.length === 1) {
			this.onAddFirstHandler();
		}
	}

	public removeHandler(cb: FChannelEvent.Callback<TData, TEvent>): void {
		const index = this._callbacks.indexOf(cb);
		if (index !== -1) {
			this._callbacks.splice(index, 1);
			if (this._callbacks.length === 0) {
				this.onRemoveLastHandler();
			}
		}
	}

	protected notify(executionContext: FExecutionContext, event: TEvent): void | Promise<void> {
		if (this._callbacks.length === 0) {
			return;
		}
		const callbacks = this._callbacks.slice();
		if (callbacks.length === 1) {
			return callbacks[0](executionContext, event);
		}
		const promises: Array<Promise<void>> = [];
		const errors: Array<FException> = [];
		for (const callback of callbacks) {
			try {
				const result = callback(executionContext, event);
				if (result instanceof Promise) {
					promises.push(result);
				}
			} catch (e) {
				errors.push(FException.wrapIfNeeded(e));
			}
		}

		if (promises.length === 1 && errors.length === 0) {
			return promises[0];
		} else if (promises.length > 0) {
			return Promise
				.all(promises.map(function (p) {
					return p.catch(function (e) {
						errors.push(e);
					});
				}))
				.then(function () {
					if (errors.length > 0) {
						for (const error of errors) {
							if (!(error instanceof FCancellationException)) {
								FExceptionAggregate.throwIfNeeded(errors);
							}
						}
						// So, all errors are CancelledError instances, throw first
						throw errors[0];
					}
				});
		} else {
			if (errors.length > 0) {
				for (const error of errors) {
					if (!(error instanceof FCancellationException)) {
						throw new FExceptionAggregate(errors);
					}
				}
				// So, all errors are CancelledError instances, throw first
				throw errors[0];
			}
		}
	}

	protected get hasSubscribers(): boolean { return this._callbacks.length > 0; }
	protected onAddFirstHandler(): void { /* NOP */ }
	protected onRemoveLastHandler(): void { /* NOP */ }
}

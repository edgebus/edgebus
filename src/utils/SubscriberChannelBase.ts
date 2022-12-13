import { FCancellationToken, FDisposableBase, FException, FExecutionContext, FInitableBase, FSubscriberChannel } from "@freemework/common";
import { FExceptionCancelled, FExceptionAggregate, FExceptionInvalidOperation } from "@freemework/common";

export abstract class SubscriberChannelBase<TData, TEvent extends FSubscriberChannel.Event<TData> = FSubscriberChannel.Event<TData>>
	extends FInitableBase implements FSubscriberChannel<TData, TEvent> {
	private readonly _callbacks: Array<FSubscriberChannel.Callback<TData, TEvent>>;
	private _broken: boolean;

	public constructor() {
		super();
		this._callbacks = [];
		this._broken = false;
	}

	public addHandler(cb: FSubscriberChannel.Callback<TData, TEvent>): void {
		this.verifyBrokenChannel();

		this._callbacks.push(cb);
		if (this._callbacks.length === 1) {
			this.onAddFirstHandler();
		}
	}

	public removeHandler(cb: FSubscriberChannel.Callback<TData, TEvent>): void {
		const index = this._callbacks.indexOf(cb);
		if (index !== -1) {
			this._callbacks.splice(index, 1);
			if (this._callbacks.length === 0) {
				this.onRemoveLastHandler();
			}
		}
	}

	protected get isBroken(): boolean { return this._broken; }

	protected verifyBrokenChannel(): void {
		if (this.isBroken) {
			throw new FExceptionInvalidOperation("Wrong operation on broken channel");
		}
	}

	protected notify(executionContext: FExecutionContext, event: TEvent | FException): void | Promise<void> {
		if (this._callbacks.length === 0) {
			return;
		}
		const callbacks = this._callbacks.slice();
		if (event instanceof Error) {
			this._broken = true;
			this._callbacks.splice(0, this._callbacks.length);
		}
		if (callbacks.length === 1) {
			return callbacks[0](executionContext, event);
		}
		const promises: Array<Promise<void>> = [];
		const errors: Array<FException> = [];
		for (const callback of callbacks) {
			try {
				const result = callback(executionContext,event);
				if (result instanceof Promise) {
					promises.push(result);
				}
			} catch (e) {
				errors.push(FException.wrapIfNeeded( e));
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
							if (!(error instanceof FExceptionCancelled)) {
								throw new FExceptionAggregate(errors);
							}
						}
						// So, all errors are CancelledError instances, throw first
						throw errors[0];
					}
				});
		} else {
			if (errors.length > 0) {
				for (const error of errors) {
					if (!(error instanceof FExceptionCancelled)) {
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

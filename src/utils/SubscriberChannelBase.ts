import { CancellationToken, SubscriberChannel } from "@zxteam/contract";
import { CancelledError, AggregateError, InvalidOperationError } from "@zxteam/errors";
import { Disposable } from "@zxteam/disposable";

export abstract class SubscriberChannelBase<TData, TEvent extends SubscriberChannel.Event<TData> = SubscriberChannel.Event<TData>>
	extends Disposable implements SubscriberChannel<TData, TEvent> {
	private readonly _callbacks: Array<SubscriberChannel.Callback<TData, TEvent>>;
	private _broken: boolean;

	public constructor() {
		super();
		this._callbacks = [];
		this._broken = false;
	}

	public addHandler(cb: SubscriberChannel.Callback<TData, TEvent>): void {
		this.verifyBrokenChannel();

		this._callbacks.push(cb);
		if (this._callbacks.length === 1) {
			this.onAddFirstHandler();
		}
	}

	public removeHandler(cb: SubscriberChannel.Callback<TData, TEvent>): void {
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
			throw new InvalidOperationError("Wrong operation on broken channel");
		}
	}

	protected notify(event: TEvent | Error): void | Promise<void> {
		if (this._callbacks.length === 0) {
			return;
		}
		const callbacks = this._callbacks.slice();
		if (event instanceof Error) {
			this._broken = true;
			this._callbacks.splice(0, this._callbacks.length);
		}
		if (callbacks.length === 1) {
			return callbacks[0](event);
		}
		const promises: Array<Promise<void>> = [];
		const errors: Array<Error> = [];
		for (const callback of callbacks) {
			try {
				const result = callback(event);
				if (result instanceof Promise) {
					promises.push(result);
				}
			} catch (e) {
				errors.push(e);
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
							if (!(error instanceof CancelledError)) {
								throw new AggregateError(errors);
							}
						}
						// So, all errors are CancelledError instances, throw first
						throw errors[0];
					}
				});
		} else {
			if (errors.length > 0) {
				for (const error of errors) {
					if (!(error instanceof CancelledError)) {
						throw new AggregateError(errors);
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

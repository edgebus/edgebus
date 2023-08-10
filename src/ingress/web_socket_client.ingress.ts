import { FChannelSubscriber, FException, FExceptionInvalidOperation, FExecutionContext, FLogger, FLoggerLabelsExecutionContext } from "@freemework/common";

import * as WebSocket from "ws";

import * as  _ from "lodash";

import { MessageBus } from "../messaging/message_bus";

import { IngressIdentifier, MessageIdentifier, Message, Topic } from "../model";

import { BaseIngress } from "./base.ingress";
import { WebSocketMessenger } from "../misc/web_socket_messenger";


export class WebSocketClientIngress extends BaseIngress {

	// private readonly _successResponseGenerator: Exclude<WebSocketClientIngress.Opts["successResponseGenerator"], undefined> | null;
	private readonly _transformers: WebSocketClientIngress.Opts["transformers"] | null;
	private readonly _url: URL;
	private readonly _ignoreStartupFailedConnection: boolean;
	private readonly _wsOptions: WebSocket.ClientOptions;
	private _lazyMessenger: WebSocketMessenger | Promise<WebSocketMessenger> | null;


	protected getMessenger(executionContext: FExecutionContext): Promise<WebSocketMessenger> {
		if (this._lazyMessenger === null) {
			this._lazyMessenger = this._createMessenger(executionContext)
				.then((messenger) => {
					this._lazyMessenger = messenger;
					return messenger;
				})
				.catch((e) => {
					this._lazyMessenger = null;
					throw e;
				});
		}

		if (this._lazyMessenger instanceof Promise) {
			return this._lazyMessenger;
		}

		return Promise.resolve(this._lazyMessenger);
	}

	private _watchdogTimeout: NodeJS.Timeout;
	private _watchdogInterval: number;

	public constructor(
		topic: Topic.Id & Topic.Name & Topic.Data,
		ingressId: IngressIdentifier,
		private readonly _messageBus: MessageBus,
		opts: WebSocketClientIngress.Opts
	) {
		super(topic, ingressId);
		// this._successResponseGenerator = null;
		this._transformers = null;
		this._lazyMessenger = null;

		this._ignoreStartupFailedConnection = false;
		this._wsOptions = opts && opts.wsOptions || {};
		this._url = opts.url;

		this._watchdogInterval = 1000;

		// Schedule watchdog as soon as possible
		this._watchdogTimeout = setTimeout(this._watchdog.bind(this), 0);


		// if (opts !== undefined) {
		this._transformers = opts.transformers;
		// 	if (opts.successResponseGenerator !== undefined) { this._successResponseGenerator = opts.successResponseGenerator; }
		// }
	}

	protected async onInit(): Promise<void> {
		try {
			await this.getMessenger(this.initExecutionContext); // Self-check for connectivity
		} catch (e) {
			const err: FException = FException.wrapIfNeeded(e);
			if (this._ignoreStartupFailedConnection) {
				const msg = "Check connection with Aggregator failed. The situation is treated just as warning according to 'ignoreStartupFailedConnection = true'";
				this._log.warn(this.initExecutionContext, () => `${msg} ${err.message}`);
				this._log.debug(this.initExecutionContext, msg, err);
			} else {
				if (this._log.isWarnEnabled) {
					this._log.warn(this.initExecutionContext, () => `Failure establish connection with ${this._url}. ${err.message}`);
				}
				throw e;
			}
		}
	}

	protected async onDispose(): Promise<void> {
		clearTimeout(this._watchdogTimeout);

		if (this._lazyMessenger !== null) {
			if (this._lazyMessenger instanceof Promise) {
				const messenger = await this._lazyMessenger;
				await messenger.dispose();
			} else {
				await this._lazyMessenger.dispose();
			}
		}
	}

	private _watchdog(): void {
		let executionContext: FExecutionContext = this.initExecutionContext;

		clearTimeout(this._watchdogTimeout); // remove timer for case user call _watchdog directly (to prevent twice call)

		if (this._lazyMessenger !== null) {
			// this._lazyMessenger !== null means we already have connection and we just need schedule next watchdog run.
			if (!this.disposed && !this.disposing) {
				// Schedule next watchdog run only if we are not destroyed
				this._watchdogTimeout = setTimeout(() => this._watchdog(), this._watchdogInterval);
			}
			return;
		}

		executionContext = new FLoggerLabelsExecutionContext(executionContext, {
			url: this._url.toString()
		});

		// Get a messenger (actually create new messenger instance due this._wsMessenger === null)
		this.getMessenger(executionContext)
			.then(() => {
				// Connected successfully, so reset watchdog interval
				this._resetWatchdogInterval();

				if (!this.disposed && !this.disposing) {
					// Schedule next watchdog run only if we are not destroyed
					this._watchdogTimeout = setTimeout(() => this._watchdog(), this._watchdogInterval);
				}

				this._log.debug(executionContext, 'Watchdog established connection to the Aggregator');
			})
			.catch(e => {
				// Failed to establish connection, increase interval
				this._increaseWatchdogInterval();
				this._log.warn(executionContext, `Watchdog failed to establish connection. ${e.message}`);
				this._log.debug(executionContext, 'Watchdog failed to establish connection.', new FException(e.message));

				if (!this.disposed && !this.disposing) {
					// Schedule next watchdog run only if we are not destroyed
					this._watchdogTimeout = setTimeout(() => this._watchdog(), this._watchdogInterval);
				}
			});
	}

	private _increaseWatchdogInterval(): void {
		if (this._watchdogInterval < 60000) {
			this._watchdogInterval += 1000;
		}
	}

	private _resetWatchdogInterval(): void {
		this._watchdogInterval = 1000;
	}



	private async _createMessenger(executionContext: FExecutionContext): Promise<WebSocketMessenger> {
		const messenger = new WebSocketMessenger(
			this._url,
			{
				wsOptions: this._wsOptions,
				// incomingPingTimeout: 60000,
				// outgoingPingTimeout: 60000,
			}
		);
		await messenger.init(executionContext);
		messenger.addHandler(this._handleMessage.bind(this));
		return messenger;
	}

	private async _handleMessage(
		executionContext: FExecutionContext,
		event: FChannelSubscriber.Event<WebSocket.Data> | FException
	): Promise<void> {
		if (event instanceof FException) {
			if (this._lazyMessenger !== null && !(this._lazyMessenger instanceof Promise)) {
				const messenger: WebSocketMessenger = this._lazyMessenger;
				this._lazyMessenger = null;
				messenger.dispose()
					.catch(e => this._brokenConnectionErrorRenderer(executionContext, e));
			}
			return Promise.resolve();
		} else {
			const { data: eventData } = event;

			const eventDataStr: string = (function () {
				if (typeof eventData === "string") { return eventData; }
				if (eventData instanceof Buffer) { return eventData.toString(); }
				throw new FExceptionInvalidOperation("Unable to handle a message from WebSocket due unsupported eventData type");

			})();

			const wsMessage: any = JSON.parse(eventDataStr);

			const ingressId: IngressIdentifier = this.ingressId;
			const messageId: MessageIdentifier = MessageIdentifier.parse(wsMessage.id);
			const messageHeaders = wsMessage.params.headers;
			const messageMediaType = wsMessage.params.mediaType;

			const messageIngressBody: Uint8Array = Buffer.from(wsMessage.params.data.rawBase64, "base64");

			let body = messageIngressBody;
			// if (this._transformers !== null) {
			// 	for (const transformer of this._transformers) {
			// 		body = WebSocketClientIngress._applyTransformer(body, transformer);
			// 	}
			// }

			const message: Message.Id & Message.Data = Object.freeze<Message.Id & Message.Data>({
				messageId,
				messageHeaders,
				messageMediaType,
				messageIngressBody,
				messageBody: body
			});

			await this._messageBus.publish(executionContext, ingressId, message);


			return Promise.resolve();
		}
	}

	private _brokenConnectionErrorRenderer(executionContext: FExecutionContext, e: any): void {
		if (this._log.isDebugEnabled) {
			this._log.debug(executionContext, "Connection is broken.", FException.wrapIfNeeded(e));
		} else {
			console.error("Connection is broken.", e);
		}
	}

	private static _applyTransformer(body: Uint8Array, transformer: WebSocketClientIngress.Transformer): Uint8Array {
		switch (transformer.kind) {
			default:
				throw new FExceptionInvalidOperation("Not supported yet");
		}
	}
}

export namespace WebSocketClientIngress {
	export interface Opts {
		readonly wsOptions: WebSocket.ClientOptions;
		readonly url: URL;

		// readonly successResponseGenerator?: () => {
		// 	readonly headers: Readonly<Record<string, string | null>> | null;
		// 	readonly body: Uint8Array | null;
		// 	readonly statusCode: number;
		// 	readonly statusDescription: string | null;
		// };
		// readonly ssl?: {
		// 	readonly clientTrustedCA: string;
		// 	readonly clientCommonName?: string;
		// };
		readonly transformers: ReadonlyArray<Transformer>;
	}

	export interface JavaScriptTransformer {
		readonly kind: "javascript";
		readonly code: string;
	}
	export type Transformer = JavaScriptTransformer;
}

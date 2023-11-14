import { FCancellationExecutionContext, FCancellationTokenSource, FCancellationTokenSourceTimeout, FDisposableBase, FException, FExceptionAggregate, FExecutionContext, FLogger } from "@freemework/common";
import { FHostingConfiguration, FWebServer, FWebSocketChannelFactoryEndpoint } from "@freemework/hosting";

import { EventEmitter } from "events";
import * as WebSocket from "ws";

import { MessageBus } from "../messaging/message_bus";
import { Message } from "../model/message";
import { Topic } from "../model/topic";
import { EventChannelBase } from "../utils/event_channel_base";
import { Bind } from "../utils/bind";
import { EgressIdentifier, MessageIdentifier } from "../model";
import { DeliveryEvidence } from "../model/delivery_evidence";

export class WebSocketHostEgressEndpoint extends FWebSocketChannelFactoryEndpoint {
	private readonly _logger: FLogger;
	private readonly _egressId: EgressIdentifier;
	private readonly _emitter: EventEmitter;
	private readonly _egressClientChannels: Array<TextChannel> = [];
	private readonly _channelsFactories: ReadonlyArray<MessageBus.ChannelFactory>;
	private _topicMessageChannels: ReadonlyArray<MessageBus.Channel> | null;

	public constructor(
		servers: ReadonlyArray<FWebServer>,
		egressId: EgressIdentifier,
		channelsFactories: ReadonlyArray<MessageBus.ChannelFactory>,
		opts: FHostingConfiguration.WebSocketEndpoint,
	) {
		super(servers, opts, { text: true });
		this._channelsFactories = channelsFactories;
		this._emitter = new EventEmitter();
		this._logger = FLogger.create(this.constructor.name);
		this._egressId = egressId;
		this._topicMessageChannels = null;
	}

	public get consumersCount(): number {
		return this._egressClientChannels.length/* + this._binaryChannels.length*/;
	}

	// public on(event: "firstConsumerAdded", listener: () => void): this;
	// public on(event: "lastConsumerRemoved", listener: () => void): this;
	// public on(event: "consumersCountChanged", listener: () => void): this;
	// public on(event: string, listener: () => void): this {
	// 	this._emitter.on(event, listener);
	// 	return this;
	// }

	protected override async createTextChannel(
		executionContext: FExecutionContext, webSocket: WebSocket, subProtocol: string
	): Promise<FWebSocketChannelFactoryEndpoint.TextChannel> {
		const channel: TextChannel = new TextChannel(
			// this._channelsFactories,
			async () => {
				// disposer
				const indexToDelete = this._egressClientChannels.indexOf(channel);
				if (indexToDelete !== -1) {
					this._egressClientChannels.splice(indexToDelete, 1);
					this._emitter.emit("consumersCountChanged");
				}
				if (this._egressClientChannels.length === 0) {
					this._emitter.emit("lastConsumerRemoved");
					await this._onLastConsumerRemoved();
				}
			},
			// this._logger
		);
		await channel.init(executionContext);

		this._egressClientChannels.push(channel);
		this._emitter.emit("consumersCountChanged");
		if (this._egressClientChannels.length === 1) {
			this._emitter.emit("firstConsumerAdded");
			await this._onFirstConsumerAdded();
		}
		return channel;
	}

	private async _onFirstConsumerAdded(): Promise<void> {
		const channels: Array<MessageBus.Channel> = [];
		try {
			for (const channelFactory of this._channelsFactories) {
				const channel: MessageBus.Channel = await channelFactory();
				channels.push(channel);
				channel.addHandler(this._onMessage);
			}
		} catch (e) {
			await FDisposableBase.disposeAll(...channels);
			throw e;
		}
		this._topicMessageChannels = Object.freeze(channels);
	}
	private async _onLastConsumerRemoved(): Promise<void> {
		if (this._topicMessageChannels !== null) {
			for (const channel of this._topicMessageChannels) {
				await channel.dispose();
				channel.removeHandler(this._onMessage); // Prevent memory leaks
			}
			this._topicMessageChannels = null;
		}
	}

	@Bind
	private async _onMessage(executionContext: FExecutionContext, event: MessageBus.Channel.Event): Promise<void> {
		const topicName: Topic["topicName"] = event.source.topicName;
		const topicKind: Topic["topicKind"] = event.source.topicKind;
		this._logger.debug(executionContext, () => `Got message from topic '${topicName}'`);
		const errors: Array<FException> = [];

		if (topicKind === Topic.Kind.Asynchronous) {
			for (const egressClientChannel of this._egressClientChannels) {
				try {
					await egressClientChannel.delivery(
						// this.initExecutionContext, // TODO: Why do we using this.initExecutionContext instead executionContext?
						executionContext,
						topicName,
						event
					);

					console.log(123);
				} catch (e) {
					errors.push(FException.wrapIfNeeded(e));
				}
			}
			FExceptionAggregate.throwIfNeeded(errors);
		} else {
			const [egressClientChannel] = this._egressClientChannels;

			await egressClientChannel.deliveryWithResponse(
				// this.initExecutionContext, // TODO: Why do we using this.initExecutionContext instead executionContext?
				executionContext,
				topicName,
				event
			);
		}
	}
}

export namespace WebSocketHostSubscriberEndpoint {
}

class TextChannel extends EventChannelBase<string> implements FWebSocketChannelFactoryEndpoint.TextChannel {
	private readonly responseWaiters: Map<MessageIdentifier, PromiseDefer> = new Map();
	private static RESPONSE_WAIT = 150000;
	private readonly _disposer: () => void | Promise<void>;


	public constructor(
		disposer: () => void | Promise<void>,
	) {
		super();
		this._disposer = disposer;
	}

	public async send(executionContext: FExecutionContext, data: string): Promise<void> {
		const dataObj = JSON.parse(data);
		const messageId: MessageIdentifier = MessageIdentifier.parse(dataObj.id);
		const defer = this.responseWaiters.get(messageId);
		if (defer) {
			defer.resolve(dataObj.params);
		}
	}

	protected onInit(): void {
		// NOP
	}

	protected async onDispose(): Promise<void> {
		return await this._disposer();
	}

	public async delivery(
		executionContext: FExecutionContext,
		topicName: Topic["topicName"],
		event: MessageBus.Channel.Event,
	): Promise<void> {
		const message: Message = event.data;
		const mediaType: string = message.messageMediaType;
		const messageBody: Buffer = Buffer.from(message.messageBody);
		let data: any = { rawBase64: messageBody.toString("base64") };
		switch (mediaType) {
			case "application/json":
				data.json = JSON.parse(messageBody.toString("utf8"));
				break;
		}

		const messageStr: string = JSON.stringify({
			jsonrpc: "2.0",
			method: topicName,
			id: message.messageId,
			params: {
				mediaType,
				headers: message.messageHeaders,
				data,
				labels: message.messageLabels.map(l => ({ id: l.labelId, value: l.labelValue }))
			}
		});

		await this.notify(executionContext, { data: messageStr });
	}

	public async deliveryWithResponse(
		executionContext: FExecutionContext,
		topicName: Topic["topicName"],
		event: MessageBus.Channel.Event
	): Promise<void> {
		const cts: FCancellationTokenSourceTimeout = new FCancellationTokenSourceTimeout(TextChannel.RESPONSE_WAIT);
		executionContext = new FCancellationExecutionContext(executionContext, cts.token, true);

		const createDefer = (executionContext: FExecutionContext): PromiseDefer => {
			const cancellationToken = FCancellationExecutionContext.of(executionContext).cancellationToken;

			const defer: any = {};
			function cancelDefer() {
				defer.reject(new FException('Timeout exception'));
			}
			const promise = new Promise<DeliveryEvidence>((resolve, reject) => {
				defer.resolve = (data: DeliveryEvidence) => {
					cancellationToken.removeCancelListener(cancelDefer);
					resolve(data);
				};
				defer.reject = (err: FException) => {
					cancellationToken.removeCancelListener(cancelDefer);
					reject(err);
				};
			});
			cancellationToken.addCancelListener(cancelDefer);
			defer.promise = promise;
			return defer;
		}

		const defer: PromiseDefer = createDefer(executionContext);
		this.responseWaiters.set(event.data.messageId, defer);

		await this.delivery(executionContext, topicName, event);
		const response: DeliveryEvidence = await defer.promise;

		event.deliveryEvidence = response;
	}
}

interface PromiseDefer {
	promise: Promise<DeliveryEvidence>;
	resolve: (data: DeliveryEvidence) => void;
	reject: (error: FException) => void;
}

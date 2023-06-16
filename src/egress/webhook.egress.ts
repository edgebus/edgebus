import { FDisposableBase, FException, FExecutionContext, FHttpClient, FInitableBase, FLogger } from "@freemework/common";

import * as ContentType from "content-type";
import { OutgoingHttpHeaders } from "http";

import { MessageBus } from "../messaging/message_bus";
import { Message } from "../model/message";
import { Egress } from "../model/egress";
import { EgressApiIdentifier } from "../misc/api-identifier";
import { Bind } from "../utils/bind";
import { Settings } from "../settings";
import { MIME_APPLICATION_JSON } from "../utils/mime";

export class WebhookEgress extends FInitableBase {

	private readonly _log: FLogger;
	private readonly _channelsFactories: ReadonlyArray<MessageBus.ChannelFactory>;
	private readonly _deliveryHttpMethod: string | null;
	private readonly _deliveryUrl: URL;
	private readonly _sslSettings: Settings.SSL | null;
	private readonly _client: FHttpClient;
	private readonly _onMessageBound: MessageBus.Channel.Callback;
	private _channels: ReadonlyArray<MessageBus.Channel> | null;

	public constructor(
		opts: WebhookEgress.Opts
	) {
		super();

		this._log = FLogger.create(this.constructor.name);

		const httpClientOpts: FHttpClient.Opts = {};
		if (opts.ssl !== null && opts.ssl.trustedCertificateAuthorities !== null) {
			httpClientOpts.sslOpts = {
				ca: [...opts.ssl.trustedCertificateAuthorities]
			};
		}
		this._client = new FHttpClient(httpClientOpts);
		this._channelsFactories = opts.channelFactories;
		this._sslSettings = opts.ssl;
		this._channels = null;

		this._onMessageBound = this._onMessage;

		this._deliveryHttpMethod = opts.deliveryHttpMethod !== undefined ? opts.deliveryHttpMethod : null;
		this._deliveryUrl = opts.deliveryUrl;

		this._log.trace(FExecutionContext.Empty, () => `Construct with delivery target '${this._deliveryUrl}' (method: '${this._deliveryHttpMethod}').`);
	}

	protected async onInit(): Promise<void> {
		const channels: Array<MessageBus.Channel> = [];
		try {
			for (const channelFactory of this._channelsFactories) {
				const channel: MessageBus.Channel = await channelFactory();
				channels.push(channel);
				channel.addHandler(this._onMessageBound);
			}
		} catch (e) {
			await FDisposableBase.disposeAll(...channels);
			throw e;
		}
		this._channels = Object.freeze(channels);
	}
	protected async onDispose(): Promise<void> {
		if (this._channels !== null) {
			for (const channel of this._channels) {
				await channel.dispose();
				channel.removeHandler(this._onMessageBound); // Prevent memory leaks
			}
			this._channels = null;
		}
	}

	@Bind
	private async _onMessage(executionContext: FExecutionContext, event: MessageBus.Channel.Event): Promise<void> {
		try {
			const message: Message.Id & Message.Data = event.data;

			const httpMethod: string | null = WebhookEgress._extractHttpMethod(message);
			const messageHeaders: OutgoingHttpHeaders = WebhookEgress._extractHttpHeaders(message);
			const body: Buffer = WebhookEgress._extractHttpBody(message);

			const response = await this._client.invoke(executionContext, {
				url: this._deliveryUrl,
				method: httpMethod !== null ? httpMethod : "POST",
				headers: messageHeaders,
				body
			});
			if (response && response.statusCode >= 200 && response.statusCode < 300) {
				this._log.info(executionContext, () => `Event from topic '${event.source.topicName}' was delivered successfully.`);

				const contentTypeValue = response.headers['content-type'];
				const contentType: ContentType.ParsedMediaType | null = contentTypeValue !== undefined
					? ContentType.parse(contentTypeValue) : null;

					event.deliveryEvidence = {
					kind: Egress.Kind.Webhook,
					headers: response.headers,
					body: response.body.toString("base64"),
					bodyJson: contentType !== null
						&& contentType.type === MIME_APPLICATION_JSON
						&& (
							contentType.parameters.charset === undefined
							|| contentType.parameters.charset.toLocaleLowerCase() === "utf-8"
						)
						? JSON.parse(response.body.toString("utf-8"))
						: null,
					statusCode: response.statusCode,
					statusDescription: response.statusDescription,
				}
			} else {
				this._log.info(executionContext, () => `Request failure, response code ${response.statusCode}`);
				throw new FException(`Request failure, response code ${response.statusCode}`);
			}
		} catch (e) {
			const err: FException = FException.wrapIfNeeded(e);
			this._log.info(executionContext, () => `Event from topic '${event.source.topicName}' was NOT delivered. ${err.message}`);
			this._log.debug(executionContext, () => `Event from topic '${event.source.topicName}' was NOT delivered.`, err);
			throw e;
		}
	}

	private static _extractHttpMethod(message: Message.Data): string | null {
		const httpMethod = message.headers['http.method'];
		if (httpMethod !== undefined) {
			return httpMethod;
		} else {
			return null;
		}
	}

	private static _extractHttpHeaders(message: Message.Data): OutgoingHttpHeaders {
		const httpHeaders: OutgoingHttpHeaders = {};

		for (const [msgHeader, value] of Object.entries(message.headers)) {
			if (msgHeader.startsWith(Message.HeaderPrefix.HTTP)) {
				const httpHeader: string = msgHeader.substring(Message.HeaderPrefix.HTTP.length);
				switch (httpHeader) {
					case "content-length":
					case "host":
						// ignore headers
						break;
					default:
						httpHeaders[httpHeader] = value;
						break;
				}
			}
		}

		return httpHeaders;
	}

	private static _extractHttpBody(message: Message.Data): Buffer {
		return Buffer.from(message.body);
	}
}

export namespace WebhookEgress {
	export interface Opts {
		readonly egressId: EgressApiIdentifier;
		readonly deliveryUrl: URL;
		readonly deliveryHttpMethod: "GET" | "POST" | "PUT" | "DELETE" | string | null;
		readonly ssl: Settings.SSL | null;
		readonly channelFactories: ReadonlyArray<MessageBus.ChannelFactory>;
	}
}

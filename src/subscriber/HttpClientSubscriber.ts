import { FExceptionArgument, FExecutionContext, FHttpClient, FInitableBase, FLogger } from "@freemework/common";

import { MessageBus } from "../messaging/MessageBus";
import { WebSocketHostSubscriberEndpoint } from "../endpoints/WebSocketHostSubscriberEndpoint";
import { Subscriber } from "../model/Subscriber";
import { Message } from "../model/Message";
import { Topic } from "../model/Topic";
import { FWebServer } from "@freemework/hosting";

export class HttpClientSubscriber extends FInitableBase {

	private readonly _channels: ReadonlyArray<MessageBus.Channel>;
	private readonly _method: string;
	private readonly _host: URL;
	private client?: FHttpClient;

	public constructor(
		opts: HttpClientSubscriber.Opts,
		private readonly _log: FLogger,
		...channels: ReadonlyArray<MessageBus.Channel>
	) {
		super();

		this._channels = channels;

		let baseBindPath = opts.baseBindPath;
		while (baseBindPath.length > 0 && baseBindPath.endsWith("/")) {
			baseBindPath = baseBindPath.slice(0, -1);
		}

		const [prefix, kind, method, host] = opts.subscriberId.split(".");

		this._method = method;
		this._host = new URL(host);

		if (prefix !== "subscriber") {
			throw new FExceptionArgument(`Wrong subscriberId prefix: '${prefix}'. Expected: 'subscriber'`, "opts.subscriberId");
		}
		if (kind !== "httpclient") {
			throw new FExceptionArgument(`Wrong subscriberId kind: '${kind}'. Expected: 'httpclient'`, "opts.subscriberId");
		}

		this._log.debug(FExecutionContext.Empty, `Construct ${HttpClientSubscriber.name} with bind host ${this._method}:'${this._host}'.`);
	}

	protected async onInit(): Promise<void> {
		this.client = new FHttpClient();
		const onMessageBound = this._onMessage.bind(this);
		this._channels.forEach(channel => {
			channel.addHandler(onMessageBound);
			channel.wakeUp();
		});

	}
	protected async onDispose(): Promise<void> {
		const onMessageBound = this._onMessage.bind(this);
		this._channels.forEach(channel => channel.removeHandler(onMessageBound));
	}

	private async _onMessage(executionContext: FExecutionContext, event: MessageBus.Channel.Event | Error): Promise<void> {
		//
		if (event instanceof Error) {
			//
			console.error(event); // TODO something
			return;
		}
		try {
			const mediaType = event.data.mediaType;
			const messageBody = event.data.messageBody;

			const data = JSON.parse(messageBody.toString("utf8"));
			const nativeMethod = data.method;
			const bodyData = Buffer.from(JSON.stringify(data.body), "utf-8");

			const response = await this.client?.invoke(executionContext, {
				url: this._host,
				method: this._method === "INHERIT" ? nativeMethod : this._method,
				headers: event.data.headers,
				body: bodyData
			});
			if (response && response.statusCode >= 300) {
				console.log(`Request failure, response code ${response.statusCode}`);
			}
			event.delivered = true;
		} catch (e) {
			event.delivered = false;
			console.log(e);
		}
	}
}

export namespace HttpClientSubscriber {
	export interface Opts {
		readonly subscriberId: Subscriber["subscriberId"];
		readonly bindServers: ReadonlyArray<FWebServer>;
		readonly baseBindPath: string;
	}
}

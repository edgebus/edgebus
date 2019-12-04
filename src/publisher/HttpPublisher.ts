import { ArgumentError, InvalidOperationError } from "@zxteam/errors";

import * as bodyParser from "body-parser";
import { Request, Response, Router } from "express";
import { v4 as uuid } from "uuid";

import { MessageBus } from "../messaging/MessageBus";

import { Topic } from "../model/Topic";
import { Message } from "../model/Message";
import { Publisher } from "../model/Publisher";

import { PublisherBase } from "./PublisherBase";
import { DUMMY_CANCELLATION_TOKEN } from "@zxteam/cancellation";

const _supportedMediaTypes: Set<string> = new Set();
_supportedMediaTypes.add("application/json");


export class HttpPublisher extends PublisherBase {
	public readonly router: Router;
	public readonly bindPath: string | null;
	private readonly _messageBus: MessageBus;
	private readonly _transformers: HttpPublisher.Opts["transformers"] | null;

	public static get supportedMediaTypes(): IterableIterator<string> {
		return _supportedMediaTypes.keys();
	}

	public constructor(
		topic: Topic.Name & Topic.Data,
		publisherId: Publisher["publisherId"],
		messageBus: MessageBus, opts?: HttpPublisher.Opts
	) {
		super(topic, publisherId);
		this._messageBus = messageBus;
		this.bindPath = null;
		this._transformers = null;
		if (opts !== undefined) {
			this._transformers = opts.transformers;
			if (opts.bindPath !== undefined) {
				this.bindPath = opts.bindPath;
			}
		}
		this.router = Router({ strict: true });
		//this.router.get("/", ())
		switch (topic.mediaType) {
			case "application/json":
				this.router.use(bodyParser.json({
					// TODO
				}));
				this.router.use(this._handleMessageApplicationJson.bind(this));
				break;
			default:
				throw new ArgumentError("topic", `Not supported mediaType: ${topic.mediaType}`);
		}
	}

	private async _handleMessageApplicationJson(req: Request, res: Response): Promise<void> {
		try {
			const body = req.body;

			let messageBody = {
				method: req.method,
				httpVersion: req.httpVersion,
				ips: req.ips,
				headers: { ...req.headers },
				body
			};

			if (this._transformers !== null) {
				for (const transformer of this._transformers) {
					messageBody = HttpPublisher._applyTransformer(messageBody, transformer);
				}
			}

			const finalMessageBody = messageBody;

			// TODO Validate final message by Topic's json schema

			const message: Message.Id & Message.Data = {
				messageId: uuid(),
				mediaType: "application/json",
				messageBody: Buffer.from(JSON.stringify(finalMessageBody))
			};

			await this._messageBus.publish(
				DUMMY_CANCELLATION_TOKEN, this.topicName, message
			);

			res.header("NF-MESSAGE-ID", message.messageId).writeHead(200).end();
		} catch (e) {
			res.writeHead(500, "Internal error").end();
		}
	}

	private static _applyTransformer(message: any, transformer: HttpPublisher.Transformer): any {
		switch (transformer.kind) {
			default:
				throw new InvalidOperationError("Not supported yet");
		}
	}
}


export namespace HttpPublisher {
	export interface Opts {
		readonly bindPath?: string;
		readonly ssl?: {
			readonly clientTrustedCA: string;
			readonly clientCommonName?: string;
		};
		readonly transformers: ReadonlyArray<Transformer>;
	}

	export interface JavaScriptTransformer {
		readonly kind: "javascript";
		readonly code: string;
	}
	export type Transformer = JavaScriptTransformer;
}

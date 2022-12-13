
import * as bodyParser from "body-parser";
import { Request, Response, Router } from "express";
import { v4 as uuid } from "uuid";
import * as  _ from "lodash";

import { MessageBus } from "../messaging/MessageBus";

import { Topic } from "../model/Topic";
import { Message } from "../model/Message";
import { Publisher } from "../model/Publisher";

import { PublisherBase } from "./PublisherBase";
import { FExceptionArgument, FExceptionInvalidOperation } from "@freemework/common";

const _supportedMediaTypes: Set<string> = new Set();
_supportedMediaTypes.add("application/json");


export class HttpPublisher extends PublisherBase {

	public readonly router: Router;
	public readonly bindPath: string | null;
	private readonly _successResponseGenerator: (() => {
		headers: { [header: string]: string },
		readonly body: Buffer,
		readonly status: number,
		readonly statusDescription: string
	}) | null;
	private readonly _messageBus: MessageBus;
	private readonly _transformers: HttpPublisher.Opts["transformers"] | null;

	public static get supportedMediaTypes(): IterableIterator<string> {
		return _supportedMediaTypes.keys();
	}

	public constructor(
		topic: Topic.Id & Topic.Data,
		publisherId: Publisher["publisherId"],
		messageBus: MessageBus,
		opts?: HttpPublisher.Opts
	) {
		super(topic, publisherId);
		this._messageBus = messageBus;
		this.bindPath = null;
		this._successResponseGenerator = null;
		this._transformers = null;
		if (opts !== undefined) {
			this._transformers = opts.transformers;
			if (opts.bindPath !== undefined) { this.bindPath = opts.bindPath; }
			if (opts.successResponseGenerator !== undefined) { this._successResponseGenerator = opts.successResponseGenerator; }
		}
		this.router = Router({ strict: true });
		//this.router.get("/", ())
		switch (topic.topicMediaType) {
			case "application/json":
				this.router.use(bodyParser.json({
					// TODO
				}));
				this.router.use(this._handleMessageApplicationJson.bind(this));
				break;
			default:
				throw new FExceptionArgument( `Not supported mediaType: ${topic.topicMediaType}`, "topic");
		}
	}

	protected onInit(): void | Promise<void> {
		// NOP
	}
	protected onDispose(): void | Promise<void> {
		// NOP
	}

	private async _handleMessageApplicationJson(req: Request, res: Response): Promise<void> {
		try {
			const body = req.body;

			let messageBody = {
				method: req.method,
				httpVersion: req.httpVersion,
				path: req.baseUrl + req.path,
				query: req.query,
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

			const messageHeaders: { [name: string]: string; } = {};
			for (const [name, value] of _.entries(req.headers)) {
				if (_.isString(value)) {
					messageHeaders[name] = value;
				}
			}

			const message: Message.Id & Message.Data = {
				messageId: uuid(),
				headers: Object.freeze(messageHeaders),
				mediaType: "application/json",
				messageBody: Buffer.from(JSON.stringify(finalMessageBody))
			};

			await this._messageBus.publish(
				this.initExecutionContext, this.topicName, message
			);

			if (this._successResponseGenerator !== null) {
				const successData = this._successResponseGenerator();
				for (const [header, value] of _.entries(successData.headers)) {
					res.header(header, value);
				}
				res.writeHead(successData.status, successData.statusDescription)
					.end(successData.body);
			} else {
				res.header("NF-MESSAGE-ID", message.messageId)
					.writeHead(200)
					.end();
			}
		} catch (e) {
			res.writeHead(500, "Internal error").end();
		}
	}

	private static _applyTransformer(message: any, transformer: HttpPublisher.Transformer): any {
		switch (transformer.kind) {
			default:
				throw new FExceptionInvalidOperation("Not supported yet");
		}
	}
}


export namespace HttpPublisher {
	export interface Opts {
		readonly bindPath?: string;
		readonly successResponseGenerator?: () => {
			headers: { [header: string]: string },
			readonly body: Buffer,
			readonly status: number,
			readonly statusDescription: string
		};
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

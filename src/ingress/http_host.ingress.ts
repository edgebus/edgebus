import { FException, FExceptionArgument, FExceptionInvalidOperation, FExecutionContext } from "@freemework/common";

import * as ContentType from "content-type";
import { Request, Response, Router } from "express";
import * as  _ from "lodash";

import { MessageBus } from "../messaging/message_bus";

import { Message, Topic } from "../model";

import { BaseIngress } from "./base.ingress";
import { DatabaseFactory } from "../data/database_factory";
import { HttpBadRequestException } from "../endpoints/exceptions";
import { MIME_APPLICATION_JSON } from "../utils/mime";
import { IngressApiIdentifier, MessageApiIdentifier } from "../misc/api-identifier";
import { Bind } from "../utils/bind";

export class HttpHostIngress extends BaseIngress {

	public readonly router: Router; // TODO: temporary public
	public readonly bindPath: string | null;
	private readonly _successResponseGenerator: Exclude<HttpHostIngress.Opts["successResponseGenerator"], undefined> | null;
	private readonly _transformers: HttpHostIngress.Opts["transformers"] | null;

	public constructor(
		topic: Topic.Id & Topic.Name & Topic.Data,
		ingressId: IngressApiIdentifier,
		private readonly _messageBus: MessageBus,
		opts?: HttpHostIngress.Opts
	) {
		super(topic, ingressId);
		this.bindPath = null;
		this._successResponseGenerator = null;
		this._transformers = null;
		if (opts !== undefined) {
			this._transformers = opts.transformers;
			if (opts.bindPath !== undefined) { this.bindPath = opts.bindPath; }
			if (opts.successResponseGenerator !== undefined) { this._successResponseGenerator = opts.successResponseGenerator; }
		}
		this.router = Router({ strict: true });
		this.router.use(function rawBody(req, res, next) {
			const chunks: Array<Uint8Array> = [];
			req.on('data', function (chunk: any) {
				if (!(chunk instanceof Uint8Array)) {
					throw new FExceptionInvalidOperation("Non-supported chunk type. Expected type of Uint8Array.");
				}
				chunks.push(chunk);
			});
			req.on('end', function () {
				req.body = Buffer.concat(chunks);
				next();
			});
		});

		switch (topic.topicMediaType) {
			case MIME_APPLICATION_JSON:
				this.router.use(this._handleMessageApplicationJson);
				break;
			default:
				throw new FExceptionArgument(`Not supported mediaType: ${topic.topicMediaType}`, "topic");
		}
	}

	protected onInit(): void | Promise<void> {
		// NOP
	}
	protected onDispose(): void | Promise<void> {
		// NOP
	}

	@Bind
	private async _handleMessageApplicationJson(req: Request, res: Response): Promise<void> {
		try {
			const ingressBody: unknown = req.body;
			if (!(ingressBody instanceof Uint8Array)) {
				throw new HttpBadRequestException("Non-supported body type. Expected type of Uint8Array.");
			}

			const contentTypeValue = req.headers['content-type'];
			const contentType: ContentType.ParsedMediaType | null = contentTypeValue !== undefined
				? ContentType.parse(contentTypeValue) : null;

			if (
				!(
					contentType !== null
					&& contentType.type === MIME_APPLICATION_JSON
					&& (
						contentType.parameters.charset === undefined
						|| contentType.parameters.charset.toLocaleLowerCase() === "utf-8"
					)
				)
			) {
				throw new HttpBadRequestException(`Non-supported content type '${contentTypeValue}'. Expected content type '${MIME_APPLICATION_JSON}'.`);
			}

			const headers: Message.Headers = Object.freeze({
				"http.method": req.method,
				"http.path": req.baseUrl + req.path,
				"http.pathAndQuery": req.originalUrl,
				"http.version": req.httpVersion,
				...(
					_.reduce(
						req.headers,
						function (acc, val, key) {
							acc[`${Message.HeaderPrefix.HTTP}${key}`] = val;
							return acc;
						},
						{} as any
					)
				)
			});

			const ingressId: IngressApiIdentifier = this.ingressId;
			const messageId: MessageApiIdentifier = new MessageApiIdentifier();

			let body = ingressBody;
			if (this._transformers !== null) {
				for (const transformer of this._transformers) {
					body = HttpHostIngress._applyTransformer(body, transformer);
				}
			}

			const message: Message.Id & Message.Data = Object.freeze({
				messageId,
				headers,
				mediaType: MIME_APPLICATION_JSON,
				ingressBody,
				body
			});

			await this._messageBus.publish(req.executionContext, ingressId, message);

			res.header("EDGEBUS-MESSAGE-ID", message.messageId.value)
			if (this._successResponseGenerator !== null) {
				const successData = this._successResponseGenerator();
				if (successData.headers !== null) {
					for (const [header, value] of _.entries(successData.headers)) {
						if (value !== null) {
							res.header(header, value);
						} else {
							res.header(header);
						}
					}
				}
				res.writeHead(successData.statusCode, successData.statusDescription ?? "OK");
				res.end(successData.body);
			} else {
				res.writeHead(200, "OK");
				res.end();
			}
		} catch (e) {
			const ex: FException = FException.wrapIfNeeded(e);
			const msg: string = `Failure to process published message. Error: ${ex.message}`;
			this._log.warn(req.executionContext, msg);
			this._log.debug(req.executionContext, msg, ex);
			if (ex instanceof HttpBadRequestException) {
				res.writeHead(400, "Bad Request");
			} else {
				res.writeHead(500, "Internal Error");
			}
			res.end();
		}
	}

	private static _applyTransformer(body: Uint8Array, transformer: HttpHostIngress.Transformer): Uint8Array {
		switch (transformer.kind) {
			default:
				throw new FExceptionInvalidOperation("Not supported yet");
		}
	}
}

export namespace HttpHostIngress {
	export interface Opts {
		readonly bindPath?: string;
		readonly successResponseGenerator?: () => {
			readonly headers: Readonly<Record<string, string | null>> | null;
			readonly body: Uint8Array | null;
			readonly statusCode: number;
			readonly statusDescription: string | null;
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

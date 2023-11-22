import { FException, FExceptionArgument, FExceptionInvalidOperation, FExecutionContext, FLogger, FLoggerLabelsExecutionContext } from "@freemework/common";

import * as ContentType from "content-type";
import { Request, Response, Router } from "express";
import * as  _ from "lodash";

import { MessageBus } from "../messaging/message_bus";

import { IngressIdentifier, MessageIdentifier, Message, Topic, Egress } from "../model";

import { BaseIngress } from "./base.ingress";
import { HttpBadRequestException } from "../endpoints/exceptions";
import { MIME_APPLICATION_JSON } from "../utils/mime";
import { Bind } from "../utils/bind";
import { ResponseHandlerBase } from "./response_handler/response_handler_base";
import { FWebServer } from "@freemework/hosting";
import { createExecutionContextMiddleware } from "../misc/express";
import { DeliveryEvidence } from "../model/delivery_evidence";

export class HttpHostIngress extends BaseIngress {
	private readonly _servers: ReadonlyArray<FWebServer>;
	private readonly _router: Router;
	private readonly _messageBus: MessageBus;
	private readonly _bindPath: string;
	private readonly _successResponseHandler: Exclude<HttpHostIngress.Opts["successResponseHandler"], undefined> | null;
	private readonly _transformers: HttpHostIngress.Opts["transformers"] | null;
	private readonly _topicMediaType: Topic["topicMediaType"];

	public constructor(
		topic: Topic.Id & Topic.Name & Topic.Data,
		ingressId: IngressIdentifier,
		messageBus: MessageBus,
		opts: HttpHostIngress.Opts
	) {
		super(topic, ingressId);
		this._bindPath = "/";
		this._successResponseHandler = null;
		this._transformers = null;
		this._messageBus = messageBus;
		this._topicMediaType = topic.topicMediaType;

		this._transformers = opts.transformers;
		this._servers = opts.servers;
		if (opts.bindPath !== undefined) { this._bindPath = opts.bindPath; }
		if (opts.successResponseHandler !== undefined) { this._successResponseHandler = opts.successResponseHandler; }

		this._router = Router({ strict: true });
		this._router.use(function rawBody(req, res, next) {
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
	}

	protected onInit(): void | Promise<void> {
		this._router.use(createExecutionContextMiddleware(this._log, this.initExecutionContext));

		switch (this._topicMediaType) {
			case MIME_APPLICATION_JSON:
				this._router.use(this._handleMessageApplicationJson);
				break;
			default:
				throw new FExceptionArgument(`Not supported mediaType: ${this._topicMediaType}`, "topic");
		}

		for (const server of this._servers) {
			server.rootExpressApplication.use(this._bindPath ?? "/", this._router);
		}
	}
	protected onDispose(): void | Promise<void> {
		// NOP
	}

	@Bind
	private async _handleMessageApplicationJson(req: Request, res: Response): Promise<void> {
		let executionContext: FExecutionContext = req.getExecutionContext();
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

			const ingressId: IngressIdentifier = this.ingressId;
			const messageId: MessageIdentifier = MessageIdentifier.generate();

			executionContext = new FLoggerLabelsExecutionContext(executionContext, {
				ingressId: ingressId.value,
				messageId: messageId.value
			});

			let body = ingressBody;
			if (this._transformers !== null) {
				for (const transformer of this._transformers) {
					body = HttpHostIngress._applyTransformer(body, transformer);
				}
			}

			const message: Message.Id & Message.Data = Object.freeze<Message.Id & Message.Data>({
				messageId,
				messageHeaders: headers,
				messageMediaType: MIME_APPLICATION_JSON,
				messageIngressBody: ingressBody,
				messageBody: body
			});

			await this._messageBus.publish(executionContext, ingressId, message);


			res.header("EDGEBUS-MESSAGE-ID", message.messageId.value)

			if (this.topicKind === Topic.Kind.Synchronous) {
				const evidences: DeliveryEvidence[] = await this._messageBus.getDeliveryEvidences(executionContext, { messageId });

				const successDeliveryEvidences: DeliveryEvidence.SuccessDeliveryEvidence[] = evidences.filter(e => e.type === DeliveryEvidence.Type.Success)  as DeliveryEvidence.SuccessDeliveryEvidence[];
				if (successDeliveryEvidences.length !== 1) {
					throw new FExceptionInvalidOperation(`Unexpected success evidence count for synchronous mode ${evidences.length}`);
				}

				const [successDeliveryEvidence] = successDeliveryEvidences;
				if (successDeliveryEvidence.data.kind === Egress.Kind.Webhook) {
					res.header(successDeliveryEvidence.data.headers);
					res.writeHead(successDeliveryEvidence.data.statusCode, successDeliveryEvidence.data.statusDescription);
					res.end(Buffer.from(successDeliveryEvidence.data.body, 'base64').toString('utf8'));
				} else {
					throw new FException(`Unexpected evidence kind ${successDeliveryEvidence.data.kind} for http host ingress`);
				}
			} else {
				if (this._successResponseHandler !== null) {
					const successData = await this._successResponseHandler.execute(executionContext, message);
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
			}
		} catch (e) {
			const ex: FException = FException.wrapIfNeeded(e);
			const msg: string = `Failure to process published message. Error: ${ex.message}`;
			this._log.warn(executionContext, msg);
			this._log.debug(executionContext, msg, ex);
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
		readonly servers: ReadonlyArray<FWebServer>;
		readonly successResponseHandler?: ResponseHandlerBase;
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

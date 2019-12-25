import { CancellationToken, Logger } from "@zxteam/contract";
import { InvalidOperationError, wrapErrorIfNeeded, ArgumentError } from "@zxteam/errors";
import { Ensure, ensureFactory, EnsureError } from "@zxteam/ensure";
import * as hosting from "@zxteam/hosting";

import * as express from "express";
import * as bodyParser from "body-parser";

import { BaseEndpoint } from "./BaseEndpoint";

import { PublisherApi } from "../api/PublisherApi";
import { Publisher } from "../model/Publisher";
import { HttpPublisher } from "../publisher/HttpPublisher";
import { Security } from "../model/Security";
import { Topic } from "../model/Topic";
import { DUMMY_CANCELLATION_TOKEN } from "@zxteam/cancellation";
import { endpointHandledException } from "./errors";

const ensure: Ensure = ensureFactory();

export class PublisherApiRestEndpoint extends BaseEndpoint {
	private readonly _api: PublisherApi;
	private readonly _httpPublishersMap: Map<HttpPublisher["publisherId"], HttpPublisher>;

	public constructor(
		servers: ReadonlyArray<hosting.WebServer>,
		api: PublisherApi,
		opts: hosting.Configuration.BindEndpoint,
		log: Logger
	) {
		super(servers, opts, log);

		this._api = api;
		this._httpPublishersMap = new Map();

		this._router.use(bodyParser.json());
		this._router.use(bodyParser.urlencoded({ extended: false }));


		function safeBinder(cb: (req: express.Request, res: express.Response) => (void | Promise<void>)) {
			function handler(req: express.Request, res: express.Response, next: express.NextFunction) {
				try {
					const result = cb(req, res);
					if (result instanceof Promise) {
						result.catch(next);
					}
				} catch (e) {
					next(e);
				}
			}
			return handler;
		}

		this._router.use("/http/:httpPublisherUUID", this.pushMessage.bind(this));
		this._router.get("/:publisherId", safeBinder(this.getPublisher.bind(this)));
		this._router.post("/http", safeBinder(this.createPublisherHttp.bind(this)));
		this._router.delete("/:publisherId", safeBinder(this.deletePublisher.bind(this)));
	}

	public addHttpPublisher(publisher: HttpPublisher): void {
		if (this._httpPublishersMap.has(publisher.publisherId)) {
			throw new InvalidOperationError("Twice add same publisher is not allowed.");
		}
		this._httpPublishersMap.set(publisher.publisherId, publisher);
		if (publisher.bindPath !== null) {
			// Temporary hard-code
			this._rootRouter.use(publisher.bindPath, (req, res, next) => {
				try {
					const result = publisher.router(req, res, next);
					return;
				} catch (e) {
					if (e instanceof ArgumentError) {
						res.writeHead(400, `Bad request. ${e.message}`).end();
						return;
					}
					this._log.debug("Failed to push message.", e);
					const err = wrapErrorIfNeeded(e);
					this._log.warn(`Failed to push message. Error: ${err.message}`);
					res.writeHead(500, "Internal Error").end();
				}
			});

		}
	}
	public removeHttpPublisher(publisherId: HttpPublisher["publisherId"]): boolean {
		return this._httpPublishersMap.delete(publisherId);
	}

	private async deletePublisher(req: express.Request, res: express.Response): Promise<void> {
		//this._api.cancelMessage(....);

		return res.writeHead(500, "Not implemented yet").end();
	}
	private async getPublisher(req: express.Request, res: express.Response): Promise<void> {
		//this._api.getMessage(....);

		return res.writeHead(500, "Not implemented yet").end();
	}
	private async createPublisherHttp(req: express.Request, res: express.Response): Promise<void> {
		try {
			const topicName = ensure.string(req.body.topic, "Сreate publisher http, req.body.topic field is not a string");
			const kind: string = ensure.string(req.body.publisherSecurityKind, "Сreate publisher http, req.query.publisherSecurityKind field is not a string");
			const token: string = ensure.string(req.body.publisherSecurityToken, "Сreate publisher http, req.query.publisherSecurityToken field is not a string");
			const clientTrustedCA: string = ensure.string(req.body.ssl.clientTrustedCA, "Сreate publisher http, req.body.ssl.clientTrustedCA field is not a string");
			const clientCommonName: string = ensure.string(req.body.ssl.clientCommonName, "Сreate publisher http, req.body.ssl.clientCommonName field is not a string");

			if (kind !== "TOKEN") {
				throw new EnsureError("Сreate publisher http, publisherSecurityKind field is not a TOKEN", kind);
			}

			const publisherSecurity: Security = { kind, token };

			const topicData: Topic.Name & Publisher.Security & { sslOption: Publisher.Data["sslOption"] } = {
				topicName,
				publisherSecurity,
				sslOption: {
					clientTrustedCA,
					clientCommonName
				}
			};

			const publisher: Publisher = await this._api.createHttpPublisher(DUMMY_CANCELLATION_TOKEN, topicData);

			const publisherUrl = new URL(req.protocol + "://" + req.host + req.originalUrl + "/" + publisher.publisherId);

			return res
				.status(201)
				.header("Content-Type", "application/json")
				.end(Buffer.from(JSON.stringify({
					publisherId: publisher.publisherId,
					url: publisherUrl
				}), "utf-8"));

		} catch (error) {
			return endpointHandledException(res, error);
		}
	}
	private async pushMessage(
		req: express.Request, res: express.Response, next: express.NextFunction
	): Promise<void> {
		try {
			const id = ensure.string(req.params.httpPublisherUUID);

			// TODO validate "id" for UUID

			const publisherId = `publisher.http.${id}`;

			const httpPublisher: HttpPublisher | undefined = this._httpPublishersMap.get(publisherId);
			if (httpPublisher === undefined) {
				this._log.info(`Wrong push publisherId: ${publisherId}`);
				return res.writeHead(404, "Not Found").end();
			}
			const result = httpPublisher.router(req, res, next);
			return;
		} catch (e) {
			if (e instanceof ArgumentError) {
				res.writeHead(400, `Bad request. ${e.message}`).end();
				return;
			}
			this._log.debug("Failed to push message.", e);
			const err = wrapErrorIfNeeded(e);
			this._log.warn(`Failed to push message. Error: ${err.message}`);
			res.writeHead(500, "Internal Error").end();
		}
	}
}

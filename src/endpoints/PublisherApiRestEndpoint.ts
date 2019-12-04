import { CancellationToken, Logger } from "@zxteam/contract";
import { InvalidOperationError, wrapErrorIfNeeded, ArgumentError } from "@zxteam/errors";
import { Ensure, ensureFactory } from "@zxteam/ensure";
import * as hosting from "@zxteam/hosting";

import * as express from "express";
import * as bodyParser from "body-parser";

import { BaseEndpoint } from "./BaseEndpoint";

import { PublisherApi } from "../api/PublisherApi";
import { Publisher } from "../model/Publisher";
import { HttpPublisher } from "../publisher/HttpPublisher";

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
		this._router.delete("/:publisherId", safeBinder(this.deletePublisher.bind(this)));
	}

	public addHttpPublisher(publisher: HttpPublisher): void {
		if (this._httpPublishersMap.has(publisher.publisherId)) {
			throw new InvalidOperationError("Twice add same publisher is not allowed.");
		}
		this._httpPublishersMap.set(publisher.publisherId, publisher);
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

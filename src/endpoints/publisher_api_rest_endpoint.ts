import { FEnsure, FEnsureException, FException, FExceptionArgument, FExceptionInvalidOperation, FExecutionContext, FLogger } from "@freemework/common";
import { FHostingConfiguration, FWebServer } from "@freemework/hosting";

import * as express from "express";
import * as bodyParser from "body-parser";

import { BaseRestEndpoint } from "./base_rest_endpoint";

import { PublisherApi } from "../api/publisher_api";
import { Publisher } from "../model/publisher";
import { HttpHostPublisher } from "../publisher/http_host_publisher";
import { Security } from "../model/security";
import { Topic } from "../model/topic";
import { endpointHandledException } from "./errors";
import { Settings } from "../settings";

const ensure: FEnsure = FEnsure.create();

export class PublisherApiRestEndpoint extends BaseRestEndpoint {
	private readonly _api: PublisherApi;
	private readonly _httpPublishersMap: Map<HttpHostPublisher["publisherId"], HttpHostPublisher>;
	protected readonly _rootRouter: express.Router;

	public constructor(
		servers: ReadonlyArray<FWebServer>,
		api: PublisherApi,
		opts: Settings.RestPublisherEndpoint
	) {
		super(servers, opts);

		this._api = api;
		this._httpPublishersMap = new Map();
		this._rootRouter = express.Router({ strict: true });

		this._router.use(bodyParser.json());
		this._router.use(bodyParser.urlencoded({ extended: false }));

		this._router.use("/http/:httpPublisherUUID", this.pushMessage.bind(this));
		this._router.get("/:publisherId", this.safeBinder(this.getPublisher.bind(this)));
		this._router.post("/http", this.safeBinder(this.createPublisherHttp.bind(this)));
		this._router.delete("/:publisherId", this.safeBinder(this.deletePublisher.bind(this)));
	}

	public addHttpPublisher(executionContext: FExecutionContext, publisher: HttpHostPublisher): void {
		const publisherId: string = publisher.publisherId;

		this._logger.info(executionContext, `Register publisher: ${publisherId} for path: ${publisher.bindPath}`);

		if (this._httpPublishersMap.has(publisherId)) {
			throw new FExceptionInvalidOperation("Twice add same publisher is not allowed.");
		}
		this._httpPublishersMap.set(publisherId, publisher);

		if (publisher.bindPath !== null) {
			// Temporary hard-code
			this._rootRouter.use(publisher.bindPath, (req, res, next) => {
				try {
					const publisher = this._httpPublishersMap.get(publisherId);
					if (publisher !== undefined) {
						publisher.router(req, res, next);
					}
				} catch (e) {
					const err: FException = FException.wrapIfNeeded(e);
					if (err instanceof FExceptionArgument) {
						res.writeHead(400, `Bad request. ${err.message}`).end();
						return;
					}
					this._logger.debug(executionContext, "Failed to push message.", err);
					this._logger.warn(executionContext, `Failed to push message. Error: ${err.message}`);
					res.writeHead(500, "Internal Error").end();
				}
			});

		}
	}
	public removeHttpPublisher(executionContext: FExecutionContext, publisherId: HttpHostPublisher["publisherId"]): boolean {
		return this._httpPublishersMap.delete(publisherId);
	}

	protected onInit(): void {
		super.onInit();

		for (const server of this._servers) {
			const rootExpressApplication = server.rootExpressApplication;
			rootExpressApplication.use(this._rootRouter);
		}
	}

	private async deletePublisher(req: express.Request, res: express.Response): Promise<void> {
		//this._api.cancelMessage(....);

		res.writeHead(500, "Not implemented yet").end();
	}
	private async getPublisher(req: express.Request, res: express.Response): Promise<void> {
		//this._api.getMessage(....);

		res.writeHead(500, "Not implemented yet").end();
	}
	private async createPublisherHttp(req: express.Request, res: express.Response): Promise<void> {
		try {
			const topicName = ensure.string(req.body.topic, "Create publisher http, req.body.topic field is not a string");
			const kind: string = ensure.string(req.body.publisherSecurityKind, "Create publisher http, req.query.publisherSecurityKind field is not a string");
			const token: string = ensure.string(req.body.publisherSecurityToken, "Create publisher http, req.query.publisherSecurityToken field is not a string");
			const clientTrustedCA: string = ensure.string(req.body.ssl.clientTrustedCA, "Create publisher http, req.body.ssl.clientTrustedCA field is not a string");
			const clientCommonName: string = ensure.string(req.body.ssl.clientCommonName, "Create publisher http, req.body.ssl.clientCommonName field is not a string");

			if (kind !== "TOKEN") {
				throw new FEnsureException("Create publisher http, publisherSecurityKind field is not a TOKEN", kind);
			}

			// const publisherSecurity: Security = { kind, token };

			// const topicData: Topic.Name & Publisher.Security & { sslOption: Publisher.Data["sslOption"] } = {
			// 	topicName,
			// 	publisherSecurity,
			// 	sslOption: {
			// 		clientTrustedCA,
			// 		clientCommonName
			// 	}
			// };

			// const publisher: Publisher = await this._api.createHttpPublisher(DUMMY_CANCELLATION_TOKEN, topicData);

			// const publisherUrl = new URL(req.protocol + "://" + req.host + req.originalUrl + "/" + publisher.publisherId);

			// return res
			// 	.status(201)
			// 	.header("Content-Type", "application/json")
			// 	.end(Buffer.from(JSON.stringify({
			// 		publisherId: publisher.publisherId,
			// 		url: publisherUrl
			// 	}), "utf-8"));

			res.writeHead(500, "Not implemented yet").end();
			return;

		} catch (error) {
			endpointHandledException(res, error);
			return;
		}
	}
	private async pushMessage(
		req: express.Request, res: express.Response, next: express.NextFunction
	): Promise<void> {
		try {
			const id = ensure.string(req.params.httpPublisherUUID);

			// TODO validate "id" for UUID

			const publisherId = `publisher.http.${id}`;

			const httpPublisher: HttpHostPublisher | undefined = this._httpPublishersMap.get(publisherId);
			if (httpPublisher === undefined) {
				this._logger.info(req.executionContext, () => `Wrong push publisherId: ${publisherId}`);
				res.writeHead(404, "Not Found").end();
				return;
			}
			const result = httpPublisher.router(req, res, next);
			return;
		} catch (e) {
			const err: FException = FException.wrapIfNeeded(e);
			if (err instanceof FExceptionArgument) {
				res.writeHead(400, `Bad request. ${err.message}`).end();
				return;
			}
			this._logger.debug(req.executionContext, "Failed to push message.", err);
			this._logger.warn(req.executionContext, () => `Failed to push message. Error: ${err.message}`);
			res.writeHead(500, "Internal Error").end();
		}
	}
}

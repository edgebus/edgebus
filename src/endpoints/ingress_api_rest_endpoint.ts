import { FEnsure, FEnsureException, FException, FExceptionArgument, FExceptionInvalidOperation, FExecutionContext, FLogger } from "@freemework/common";
import { FHostingConfiguration, FWebServer } from "@freemework/hosting";

import * as express from "express";
import * as bodyParser from "body-parser";

import { BaseRestEndpoint } from "./base_rest_endpoint";

import { PublisherApi } from "../api/publisher_api";
import { HttpHostIngress } from "../ingress/http_host.ingress";
import { endpointHandledException } from "./errors";
import { Settings } from "../settings";
import { createExecutionContextMiddleware } from "../misc/express";
import { IngressIdentifier } from "../model";
import { Bind } from "../utils/bind";

const ensure: FEnsure = FEnsure.create();

export class IngressApiRestEndpoint extends BaseRestEndpoint {
	private readonly _api: PublisherApi;
	private readonly _httpPublishersMap: Map<HttpHostIngress["ingressId"], HttpHostIngress>;
	protected readonly _publisherRootRouter: express.Router;

	public constructor(
		servers: ReadonlyArray<FWebServer>,
		api: PublisherApi,
		opts: Settings.RestIngressEndpoint
	) {
		super(servers, opts);

		this._api = api;
		this._httpPublishersMap = new Map();
		this._publisherRootRouter = express.Router({ strict: true });
	}

	public addHttpPublisher(executionContext: FExecutionContext, ingress: HttpHostIngress): void {
		const ingressId: IngressIdentifier = ingress.ingressId;

		this._logger.info(executionContext, `Register ingress: ${ingressId} for path: ${ingress.bindPath}`);

		if (this._httpPublishersMap.has(ingressId)) {
			throw new FExceptionInvalidOperation("Twice add same ingress is not allowed.");
		}
		this._httpPublishersMap.set(ingressId, ingress);

		if (ingress.bindPath !== null) {
			// Temporary hard-code
			this._publisherRootRouter.use(ingress.bindPath, (req, res, next) => {
				try {
					const ingress = this._httpPublishersMap.get(ingressId);
					if (ingress !== undefined) {
						ingress.router(req, res, next);
					} else {
						next();
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
	public removeHttpPublisher(executionContext: FExecutionContext, ingressId: HttpHostIngress["ingressId"]): boolean {
		return this._httpPublishersMap.delete(ingressId);
	}

	protected onInit(): void {
		super.onInit();

		this._publisherRootRouter.use(createExecutionContextMiddleware(this._logger, this.initExecutionContext));

		this._router.use(bodyParser.json());
		this._router.use(bodyParser.urlencoded({ extended: false }));

		this._router.use("/http/:ingressId", this.pushMessage);
		this._router.get("/:ingressId", this.safeBinder(this.getPublisher));
		this._router.post("/http", this.safeBinder(this.createPublisherHttp));
		this._router.delete("/:ingressId", this.safeBinder(this.deletePublisher));

		for (const server of this._servers) {
			const rootExpressApplication = server.rootExpressApplication;
			rootExpressApplication.use(this._publisherRootRouter);
		}
	}

	@Bind
	private async deletePublisher(req: express.Request, res: express.Response): Promise<void> {
		//this._api.cancelMessage(....);

		res.writeHead(500, "Not implemented yet").end();
	}

	@Bind
	private async getPublisher(req: express.Request, res: express.Response): Promise<void> {
		//this._api.getMessage(....);

		res.writeHead(500, "Not implemented yet").end();
	}

	@Bind
	private async createPublisherHttp(req: express.Request, res: express.Response): Promise<void> {
		try {
			const topicName = ensure.string(req.body.topic, "Create ingress http, req.body.topic field is not a string");
			const kind: string = ensure.string(req.body.publisherSecurityKind, "Create ingress http, req.query.publisherSecurityKind field is not a string");
			const token: string = ensure.string(req.body.publisherSecurityToken, "Create ingress http, req.query.publisherSecurityToken field is not a string");
			const clientTrustedCA: string = ensure.string(req.body.ssl.clientTrustedCA, "Create ingress http, req.body.ssl.clientTrustedCA field is not a string");
			const clientCommonName: string = ensure.string(req.body.ssl.clientCommonName, "Create ingress http, req.body.ssl.clientCommonName field is not a string");

			if (kind !== "TOKEN") {
				throw new FEnsureException("Create ingress http, publisherSecurityKind field is not a TOKEN", kind);
			}

			// const publisherSecurity: Security = { kind, token };

			// const topicData: Topic.Name & Ingress.Security & { sslOption: Ingress.Data["sslOption"] } = {
			// 	topicName,
			// 	publisherSecurity,
			// 	sslOption: {
			// 		clientTrustedCA,
			// 		clientCommonName
			// 	}
			// };

			// const ingress: Ingress = await this._api.createHttpPublisher(DUMMY_CANCELLATION_TOKEN, topicData);

			// const publisherUrl = new URL(req.protocol + "://" + req.host + req.originalUrl + "/" + ingress.ingressId);

			// return res
			// 	.status(201)
			// 	.header("Content-Type", "application/json")
			// 	.end(Buffer.from(JSON.stringify({
			// 		ingressId: ingress.ingressId,
			// 		url: publisherUrl
			// 	}), "utf-8"));

			res.writeHead(500, "Not implemented yet").end();
			return;

		} catch (error) {
			endpointHandledException(res, error);
			return;
		}
	}

	@Bind
	private async pushMessage(
		req: express.Request, res: express.Response, next: express.NextFunction
	): Promise<void> {
		try {
			const ingressIdStr = ensure.string(req.params.ingressId);

			// TODO validate "id" for UUID

			const ingressId: IngressIdentifier = IngressIdentifier.parse(ingressIdStr);

			const httpPublisher: HttpHostIngress | undefined = this._httpPublishersMap.get(ingressId);
			if (httpPublisher === undefined) {
				this._logger.info(req.executionContext, () => `Wrong push ingressId: ${ingressId}`);
				res.writeHead(404, "Not Found").end();
				return;
			}
			httpPublisher.router(req, res, next);
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

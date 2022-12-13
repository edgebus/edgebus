import { FEnsure, FLogger } from "@freemework/common";
import { FHostingConfiguration, FServersBindEndpoint, FWebServer } from "@freemework/hosting";

import * as crypto from "crypto";
import * as express from "express";
import * as bodyParser from "body-parser";

import { SubscriberApi } from "../api/SubscriberApi";

import { endpointHandledException } from "./errors";

import { Topic } from "../model/Topic";
import { Subscriber } from "../model/Subscriber";
import { Security } from "../model/Security";

const ensure: FEnsure = FEnsure.create();

export class SubscriberApiRestEndpoint extends FServersBindEndpoint {
	private readonly _api: SubscriberApi;

	public constructor(
		servers: ReadonlyArray<FWebServer>,
		api: SubscriberApi,
		opts: FHostingConfiguration.BindEndpoint,
		log: FLogger
	) {
		super(servers, opts);
		this._api = api;
	}

	public get bindPath(): string { return this._bindPath; }
	public get servers(): ReadonlyArray<FWebServer> { return this._servers; }

	protected onInit(): void {
		for (const server of this._servers) {
			const app: express.Application = server.rootExpressApplication;

			const router = express.Router({ strict: true });
			app.use(this._bindPath, router);

			router.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
				if (this.disposing || this.disposed) {
					return res.writeHead(503, "Service temporary unavailable. Going to maintenance...").end();
				} else {
					next();
				}
			});

			router.use(bodyParser.json());
			router.use(bodyParser.urlencoded({ extended: false }));

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

			// router.get("/", safeBinder(this.listSubscribers.bind(this)));
			// router.post("/webhook", safeBinder(this.subscribeWebhook.bind(this)));
			// router.delete("/webhook", safeBinder(this.unsubscribeWebhook.bind(this)));
		}
	}

	protected onDispose(): void {
		//
	}

	// private async listSubscribers(req: express.Request, res: express.Response): Promise<void> {
	// 	try {
	// 		const kind: string = ensure.string(req.query["subscriberSecurity.kind"],
	//"listSubscribers, req.query.subscriberSecurity.kind field is not a string");
	// 		const token: string = ensure.string(req.query["subscriberSecurity.token"],
	//"listSubscribers, req.query.subscriberSecurity.token field is not a string");

	// 		if (kind !== "TOKEN") {
	// 			throw new EnsureError("subscribeWebhook, subscriberSecurity.kind field is not a TOKEN", kind);
	// 		}

	// 		const security: Security = { kind, token };

	// 		const subscribers: Array<Subscriber> = await this._api.list(DUMMY_CANCELLATION_TOKEN, security);
	// 		// TODO: repack response
	// 		res.end(JSON.stringify(subscribers, null, "\t") + "\n");
	// 	} catch (e) {
	// 		this._log.error("getTopics fault", e);
	// 		res.status(500).end();
	// 	}
	// }

	// private async subscribeWebhook(req: express.Request, res: express.Response): Promise<void> {
	// 	try {
	// 		// TODO: Read topicDomain from client's certificate
	// 		const topicDomain: string | null = null;

	// 		const reqTopic: string = ensure.string(req.body.topic, "subscribeWebhook, request.body.topic field is not a string");

	// 		const subscriberSecurity: any = ensure.object(req.body.subscriberSecurity,
	//"subscribeWebhook, request.body.subscriberSecurity field is not a string");
	// 		const kind: string = ensure.string(subscriberSecurity.kind, "subscribeWebhook, subscriberSecurity.kind field is not a string");
	// 		const token: string = ensure.string(subscriberSecurity.token, "subscribeWebhook, subscriberSecurity.token field is not a string");

	// 		const reqUrl: string = ensure.string(req.body.url, "subscribeWebhook, request.body.url field is not a string");
	// 		const trustedCA: string = ensure.string(req.body.trustedCA, "subscribeWebhook, request.body.trustedCA field is not a object");
	// 		const headerToken: string = ensure.string(req.body.headerToken, "subscribeWebhook, request.body.headerToken field is not a object");

	// 		if (kind !== "TOKEN") {
	// 			throw new EnsureError("subscribeWebhook, subscriberSecurity.kind field is not a TOKEN", kind);
	// 		}

	// 		const topicData: Topic.Id = {
	// 			topicName: reqTopic,
	// 			topicDomain
	// 		};

	// 		const webhookData: Subscriber.Webhook & SubscriberSecurity = {
	// 			kind: Subscriber.Kind.Webhook,
	// 			subscriberSecurity: { kind, token },
	// 			url: new URL(reqUrl),
	// 			trustedCaCertificate: trustedCA,
	// 			headerToken
	// 		};

	// 		const webhook: Subscriber<Subscriber.Webhook> = await this._api
	// 			.subscribeWebhook(DUMMY_CANCELLATION_TOKEN, topicData, webhookData);

	// 		return res
	// 			.status(201)
	// 			.header("Content-Type", "application/json")
	// 			.end(Buffer.from(JSON.stringify({
	// 				kind: "webhook",
	// 				subscriberId: webhook.subscriberId,
	// 				topic: webhook.topicName,
	// 				url: webhook.url,
	// 				trustedCA: webhook.trustedCaCertificate,
	// 				headerToken: webhook.headerToken,
	// 				transformers: "no save"
	// 			}), "utf-8"));
	// 	} catch (error) {
	// 		this._log.error(error);
	// 		return endpointHandledException(res, error);
	// 	}
	// }

	// private async unsubscribeWebhook(req: express.Request, res: express.Response): Promise<void> {
	// 	try {
	// 		const reqTopic: string = ensure.string(req.body.topic, "subscribeWebhook, request.body.topic field is not a string");
	// 		const subscriberSecurityKind: string = ensure.string(req.body.subscriberSecurityKind,
	// "subscribeWebhook, request.body.subscriberSecurityKind field is not a string");
	// 		const subscriberSecurityToken: string = ensure.string(req.body.subscriberSecurityToken,
	// "subscribeWebhook, request.body.subscriberSecurityToken field is not a string");
	// 		const reqUrl: string = ensure.string(req.body.url, "subscribeWebhook, request.body.url field is not a string");
	// 		const trustedCA: string = ensure.string(req.body.trustedCA, "subscribeWebhook, request.body.trustedCA field is not a object");
	// 		const headerToken: string = ensure.string(req.body.headerToken, "subscribeWebhook, request.body.headerToken field is not a object");

	// 		if (subscriberSecurityKind !== "TOKEN") {
	// 			return res.writeHead(400, "Bad subscriberSecurityKind").end();
	// 		}

	// 		const topicData: Topic.Id = {
	// 			topicName: reqTopic,
	// 			topicDomain: null
	// 		};
	// 		const webhookData: Subscriber.Webhook & SubscriberSecurity = {
	// 			kind: Subscriber.Kind.Webhook,
	// 			subscriberSecurity: {
	// 				kind: subscriberSecurityKind,
	// 				token: subscriberSecurityToken
	// 			},
	// 			url: new URL(reqUrl),
	// 			trustedCaCertificate: trustedCA,
	// 			headerToken
	// 		};

	// 		const webhook: Subscriber<Subscriber.Webhook> = await this._api
	// 			.subscribeWebhook(DUMMY_CANCELLATION_TOKEN, topicData, webhookData);

	// 		return res
	// 			.status(201)
	// 			.header("Content-Type", "application/json")
	// 			.end(Buffer.from(JSON.stringify({
	// 				webhookId: webhook.subscriberId,
	// 				url: webhook.url,
	// 				topicName: webhook.topicName
	// 			}), "utf-8"));
	// 	} catch (error) {
	// 		this._log.error(error);
	// 		return endpointHandledException(res, error);
	// 	}
	// }

	// private async cancelMessage(req: express.Request, res: express.Response): Promise<void> {
	// 	//this._api.cancelMessage(....);

	// 	return res.writeHead(500, "Not implemented yet").end();
	// }
	// private async getMessage(req: express.Request, res: express.Response): Promise<void> {
	// 	//this._api.getMessage(....);

	// 	return res.writeHead(500, "Not implemented yet").end();
	// }
	// private async publishMessage(req: express.Request, res: express.Response): Promise<void> {
	// 	//this._api.publishMessage(....);

	// 	return res.writeHead(500, "Not implemented yet").end();
	// }
}

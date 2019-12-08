import { CancellationToken, Logger } from "@zxteam/contract";
import { InvalidOperationError } from "@zxteam/errors";
import { ensureFactory, Ensure, EnsureError } from "@zxteam/ensure";
import * as hosting from "@zxteam/hosting";

import * as crypto from "crypto";
import * as express from "express";
import * as bodyParser from "body-parser";

import { SubscriberApi } from "../api/SubscriberApi";
import { Webhook } from "../model/Webhook";

import { handledException } from "./errors";
// TO REMOVE
import { DUMMY_CANCELLATION_TOKEN } from "@zxteam/cancellation";
import { Topic } from "../model/Topic";
import { Subscriber } from "../model/Subscriber";

const ensure: Ensure = ensureFactory();

export class SubscriberApiRestEndpoint extends hosting.ServersBindEndpoint {
	private readonly _api: SubscriberApi;

	public constructor(
		servers: ReadonlyArray<hosting.WebServer>,
		api: SubscriberApi,
		opts: hosting.Configuration.BindEndpoint,
		log: Logger
	) {
		super(servers, opts, log);
		this._api = api;
	}

	public get bindPath(): string { return this._bindPath; }
	public get servers(): ReadonlyArray<hosting.WebServer> { return this._servers; }

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

			router.get("/topic", safeBinder(this.getTopics.bind(this)));
			router.post("/webhook", safeBinder(this.subscribeWebhook.bind(this)));
			router.delete("/webhook", safeBinder(this.unsubscribeWebhook.bind(this)));
		}
	}

	protected onDispose(): void {
		//
	}

	private async getTopics(req: express.Request, res: express.Response): Promise<void> {
		try {
			const topics: SubscriberApi.TopicMap = await this._api.getAvailableTopics(DUMMY_CANCELLATION_TOKEN);

			const response: {
				[topicName: string]: {
					description: string;
				};
			} = {};

			for (const topic of topics) {
				response[topic[1].topicName] = {
					description: topic[1].topicDescription
				};
			}

			res.end(JSON.stringify(response, null, "\t") + "\n");
		} catch (e) {
			this._log.error("getTopics fault", e);
			res.status(500).end();
		}
	}

	private async subscribeWebhook(req: express.Request, res: express.Response): Promise<void> {
		try {
			const reqTopic: string = ensure.string(req.body.topic, "subscribeWebhook, request.body.topic field is not a string");
			const subscriberSecurityKind: string = ensure.string(req.body.subscriberSecurityKind, "subscribeWebhook, request.body.subscriberSecurityKind field is not a string");
			const subscriberSecurityToken: string = ensure.string(req.body.subscriberSecurityToken, "subscribeWebhook, request.body.subscriberSecurityToken field is not a string");
			const reqUrl: string = ensure.string(req.body.url, "subscribeWebhook, request.body.url field is not a string");
			const trustedCA: string = ensure.string(req.body.trustedCA, "subscribeWebhook, request.body.trustedCA field is not a object");
			const headerToken: string = ensure.string(req.body.headerToken, "subscribeWebhook, request.body.headerToken field is not a object");

			if (subscriberSecurityKind !== "TOKEN") {
				return res.writeHead(400, "Bad subscriberSecurityKind").end();
			}

			const topicData: Topic.Name & Subscriber.Security = {
				topicName: reqTopic,
				subscriberSecurity: {
					kind: subscriberSecurityKind,
					token: subscriberSecurityToken
				}
			};
			const webhookData: Webhook.Data = {
				url: new URL(reqUrl),
				trustedCaCertificate: trustedCA,
				headerToken
			};

			const webhook: Webhook = await this._api.subscriberWebhook(DUMMY_CANCELLATION_TOKEN, topicData, webhookData);

			return res
				.status(201)
				.header("Content-Type", "application/json")
				.end(Buffer.from(JSON.stringify({
					webhookId: webhook.webhookId,
					url: webhook.url,
					topicName: webhook.topicName
				}), "utf-8"));
		} catch (error) {
			this._log.error(error);
			return handledException(res, error);
		}
	}

	private async unsubscribeWebhook(req: express.Request, res: express.Response): Promise<void> {
		try {
			const reqTopic: string = ensure.string(req.body.topic, "subscribeWebhook, request.body.topic field is not a string");
			const subscriberSecurityKind: string = ensure.string(req.body.subscriberSecurityKind, "subscribeWebhook, request.body.subscriberSecurityKind field is not a string");
			const subscriberSecurityToken: string = ensure.string(req.body.subscriberSecurityToken, "subscribeWebhook, request.body.subscriberSecurityToken field is not a string");
			const reqUrl: string = ensure.string(req.body.url, "subscribeWebhook, request.body.url field is not a string");
			const trustedCA: string = ensure.string(req.body.trustedCA, "subscribeWebhook, request.body.trustedCA field is not a object");
			const headerToken: string = ensure.string(req.body.headerToken, "subscribeWebhook, request.body.headerToken field is not a object");

			if (subscriberSecurityKind !== "TOKEN") {
				return res.writeHead(400, "Bad subscriberSecurityKind").end();
			}

			const topicData: Topic.Name & Subscriber.Security = {
				topicName: reqTopic,
				subscriberSecurity: {
					kind: subscriberSecurityKind,
					token: subscriberSecurityToken
				}
			};
			const webhookData: Webhook.Data = {
				url: new URL(reqUrl),
				trustedCaCertificate: trustedCA,
				headerToken
			};

			const webhook: Webhook = await this._api.subscriberWebhook(DUMMY_CANCELLATION_TOKEN, topicData, webhookData);

			return res
				.status(201)
				.header("Content-Type", "application/json")
				.end(Buffer.from(JSON.stringify({
					webhookId: webhook.webhookId,
					url: webhook.url,
					topicName: webhook.topicName
				}), "utf-8"));
		} catch (error) {
			this._log.error(error);
			return handledException(res, error);
		}
	}

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

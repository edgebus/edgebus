import { CancellationToken, Logger } from "@zxteam/contract";
import { InvalidOperationError } from "@zxteam/errors";
import * as hosting from "@zxteam/hosting";

import * as crypto from "crypto";
import * as express from "express";
import * as bodyParser from "body-parser";

import { SubscriberApi } from "../api/SubscriberApi";
import { Webhook } from "../model/Webhook";

import { TOKEN_BYTES_LEN } from "../constants";

// TO REMOVE
import { DUMMY_CANCELLATION_TOKEN } from "@zxteam/cancellation";
import { Topic } from "../model/Topic";


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
			// TODO check signature
			const isValidSignature = helper.checkSignature(req);
			if (!isValidSignature) {
				// Forbidden Error 404
				res.status(404).end();
			}

			// TODO resolve recipientUserId
			const recipientUserId = helper.getRecipientUserId(req);

			const topics: SubscriberApi.TopicMap = await this._api.getAvailableTopics(DUMMY_CANCELLATION_TOKEN);

			const response: {
				[topicName: string]: {
					description: string;
				};
			} = {};

			for (const topic of topics) {
				response[topic[1].name] = {
					description: topic[1].description
				};
			}

			res.end(JSON.stringify(response, null, "\t") + "\n");
		} catch (e) {
			this._log.error("getTopics fault", e);
			res.status(500).end();
		}
	}

	private async subscribeWebhook(req: express.Request, res: express.Response): Promise<void> {
		const webhookData: Webhook.Data = helper.parseOptionsForWebHook(req);

		const topicInfo: Topic.Id & Topic.SubscriberSecurity = {
			topicId: "My secret topic",
			subscriberSecurityKind: "TOKEN",
			subscriberSecurityToken: "??? my secret token ???"
		};

		const webhook: Webhook = await this._api.subscribeWebhook(DUMMY_CANCELLATION_TOKEN, topicInfo, webhookData);

		return res
			.writeHead(201, "Created")
			.header("Content-Type", "application/json")
			.end(Buffer.from(JSON.stringify({
				webhookId: webhook.webhookId,
				url: webhook.url,
				topicId: webhook.topicId,
				securityKind: webhook.securityKind,
				securityToken: webhook.securityToken
			}), "utf-8"));
	}

	private async unsubscribeWebhook(req: express.Request, res: express.Response): Promise<void> {
		throw new InvalidOperationError("Method does not have implementation yet");
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


namespace helper {
	export function getRecipientUserId(req: express.Request) {
		// TODO resolve recipientUserId
		return "HARD_CODED_USER";
	}

	export function checkSignature(req: express.Request): boolean {
		const argKey = req.header("NS-ACCESS-KEY");
		const argSign = req.header("NS-ACCESS-SIGN");
		const argTimestamp = req.header("NS-ACCESS-TIMESTAMP");
		const argPassphrase = req.header("NS-ACCESS-PASSPHRASE");

		return true;
	}

	export function parseOptionsForWebHook(req: express.Request): Webhook.Data {
		const opts: Webhook.Data = {
			url: new URL("www.google.com/1")
		};

		return opts;
	}
}

import { CancellationToken, Logger } from "@zxteam/contract";
import { DUMMY_CANCELLATION_TOKEN } from "@zxteam/cancellation";
import * as hosting from "@zxteam/hosting";

import * as express from "express";
import * as bodyParser from "body-parser";

import { ManagementApi } from "../api/ManagementApi";
import { InvalidOperationError } from "@zxteam/errors";
import { Webhook } from "../model/Webhook";

export class ManagementApiRestEndpoint extends hosting.ServersBindEndpoint {
	private readonly _api: ManagementApi;

	public constructor(
		servers: ReadonlyArray<hosting.WebServer>,
		api: ManagementApi,
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
			//router.use(bodyParser);
			app.use(this._bindPath, router);

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

			router.get("/topics", safeBinder(this.getTopics.bind(this)));
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

			const topis: ManagementApi.TopicMap = await this._api.getAvailableTopics(DUMMY_CANCELLATION_TOKEN, recipientUserId);

			const response: {
				[topicName: string]: {
					description: string;
				};
			} = {};

			topis.forEach(function (topic) {
				response[topic.topicName] = {
					description: topic.topicDescription
				};
			});

			res.end(JSON.stringify(response, null, "\t") + "\n");
		} catch (e) {
			this._log.error("getTopics fault", e);
			res.status(500).end();
		}
	}

	private async subscribeWebhook(req: express.Request, res: express.Response): Promise<void> {
		try {
			// TODO check signature
			const isValidSignature = helper.checkSignature(req);
			if (!isValidSignature) {
				// Forbidden Error 404
				res.status(404).end("Forbidden Error, invalid access permission");
			}

			// TODO resolve recipientUserId
			const recipientUserId = helper.getRecipientUserId(req);

			const opts = helper.getOptionsForWebHook(req);

			const isSubscribe: Webhook.Id = await this._api.subscribeWebhook(DUMMY_CANCELLATION_TOKEN, recipientUserId, opts);

			if (isSubscribe) {
				res.status(200).end("Successfully" + "\n");
			}
			res.status(400).end();

		} catch (e) {
			this._log.error("subscribeWebhook fault", e);
			res.status(500).end();
		}
	}

	private async unsubscribeWebhook(req: express.Request, res: express.Response): Promise<void> {
		throw new InvalidOperationError("Method does not have implementation yet");
	}
}

export namespace helper {
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

	export function getOptionsForWebHook(req: express.Request): Webhook.Data {
		const opts: Webhook.Data = {
			url: new URL("www.google.com/1"),
			topicId: "1001-1001"
		};

		return opts;
	}
}

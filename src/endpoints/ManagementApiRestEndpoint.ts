import { CancellationToken, Logger } from "@zxteam/contract";
import { DUMMY_CANCELLATION_TOKEN } from "@zxteam/cancellation";
import { InvalidOperationError } from "@zxteam/errors";
import * as hosting from "@zxteam/hosting";

import * as express from "express";
import * as http from "http";
import * as bodyParser from "body-parser";

import { ManagementApi } from "../api/ManagementApi";

import { Topic } from "../model/Topic";

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

			router.post("/topic", safeBinder(this.createTopic.bind(this)));
			router.delete("/topic/:webhookId", safeBinder(this.destroyTopic.bind(this)));
		}
	}

	protected onDispose(): void {
		//
	}

	private async createTopic(req: express.Request, res: express.Response): Promise<void> {

		const topicData: Topic.Data = {
			name: req.query.name,
			description: req.query.description
		};

		const topic: Topic = await this._api.createTopic(DUMMY_CANCELLATION_TOKEN, topicData);

		return res
			.writeHead(201, "Created")
			.header("Content-Type", "application/json")
			.end(Buffer.from(JSON.stringify({
				topicId: topic.topicId,
				name: topic.name,
				description: topic.description,
				topicSecurityKind: topic.topicSecurityKind,
				topicSecurityToken: topic.topicSecurityToken,
				publisherSecurityKind: topic.publisherSecurityKind,
				publisherSecurityToken: topic.publisherSecurityToken,
				subscriberSecurityKind: topic.subscriberSecurityKind,
				subscriberSecurityToken: topic.subscriberSecurityToken
			}), "utf-8"));
	}

	private async destroyTopic(req: express.Request, res: express.Response): Promise<void> {
		throw new InvalidOperationError("Method does not have implementation yet");
	}
}

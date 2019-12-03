import { CancellationToken, Logger } from "@zxteam/contract";
import { DUMMY_CANCELLATION_TOKEN } from "@zxteam/cancellation";
import { InvalidOperationError } from "@zxteam/errors";
import * as hosting from "@zxteam/hosting";

import * as express from "express";
import * as http from "http";
import * as bodyParser from "body-parser";

import { ManagementApi } from "../api/ManagementApi";

import { Topic } from "../model/Topic";
import {
	ForbiddenPersistentStorageError,
	NoRecordPersistentStorageError,
	BadRequestPersistentStorageError
} from "../data/PersistentStorage";

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
			router.delete("/topic/:name", safeBinder(this.destroyTopic.bind(this)));
		}
	}

	protected onDispose(): void {
		//
	}

	private async createTopic(req: express.Request, res: express.Response): Promise<void> {

		const topicName = req.body.name;
		const topicDescription = req.body.description;
		const mediaType = "";

		if (!topicName || !topicDescription) {

			const message = {
				error: "required parameters",
				message: "[name, description] is missing"
			};

			return res
				.status(400)
				.header("Content-Type", "application/json")
				.end(JSON.stringify(message));
		}

		const topicData: Topic.Name & Topic.Description = { topicName, topicDescription };

		const topic: Topic = await this._api.createTopic(DUMMY_CANCELLATION_TOKEN, topicData);

		return res
			.status(201)
			.header("Content-Type", "application/json")
			.end(Buffer.from(JSON.stringify({
				name: topic.topicName,
				description: topic.topicDescription,
				topicSecurity: {
					kind: topic.topicSecurity.kind,
					token: topic.topicSecurity.token

				},
				publisherSecurity: {
					kind: topic.publisherSecurity.kind,
					token: topic.publisherSecurity.token

				},
				subscriberSecurity: {
					kind: topic.subscriberSecurity.kind,
					token: topic.subscriberSecurity.token

				}
			}), "utf-8"));
	}

	private async destroyTopic(req: express.Request, res: express.Response): Promise<void> {

		const topicName = req.params.name;
		const kind = req.body.topicSecurityKind;
		const token = req.body.topicSecurityToken;

		if (!topicName || !kind || !token) {

			const message = {
				error: "required parameters",
				message: "[name, topicSecurityKind, topicSecurityToken] is missing"
			};

			return res
				.status(400)
				.header("Content-Type", "application/json")
				.end(JSON.stringify(message));
		}

		const topic: Topic.Name & Topic.Security = {
			topicName,
			topicSecurity: { kind, token }
		};

		try {

			await this._api.destroyTopic(DUMMY_CANCELLATION_TOKEN, topic);

			return res.writeHead(200, "Delete").end();

		} catch (error) {
			return helper.handledException(res, error);
		}
	}
}

export namespace helper {
	export function handledException(res: express.Response, error: any) {

		if (error instanceof BadRequestPersistentStorageError) {
			return res.writeHead(400, "Bad request").end();
		}
		if (error instanceof ForbiddenPersistentStorageError) {
			return res.writeHead(403, "Forbidden").end();
		}
		if (error instanceof NoRecordPersistentStorageError) {
			return res.writeHead(404, "No data").end();
		}

		return res.writeHead(500, "Unhandled exception").end();
	}
}

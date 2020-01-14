import { CancellationToken, Logger } from "@zxteam/contract";
import { DUMMY_CANCELLATION_TOKEN } from "@zxteam/cancellation";
import { ensureFactory, Ensure } from "@zxteam/ensure";
import { InvalidOperationError } from "@zxteam/errors";
import * as hosting from "@zxteam/hosting";

import * as express from "express";
import * as bodyParser from "body-parser";

import { ManagementApi } from "../api/ManagementApi";
import { endpointHandledException } from "./errors";
import { Topic } from "../model/Topic";

const ensure: Ensure = ensureFactory();

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

			router.get("/topic", safeBinder(this.listTopics.bind(this)));
			router.post("/topic", safeBinder(this.createTopic.bind(this)));
			//router.delete("/topic/:name", safeBinder(this.destroyTopic.bind(this)));
		}
	}

	protected onDispose(): void {
		//
	}

	private async createTopic(req: express.Request, res: express.Response): Promise<void> {
		try {
			const topicDomain: string | null = null; // TODO get from CN of the cert

			const topicName = ensure.string(req.body.name, "Create topic, 'name' should be a string");
			const topicDescription = ensure.string(req.body.description, "Create topic, 'description' should be a string");
			const topicMediaType = ensure.string(req.body.mediaType, "Create topic, 'mediaType' should be a string");

			const topicData: Topic.Id & Topic.Data = {
				topicDomain,
				topicName,
				topicDescription,
				topicMediaType
			};

			const topic = await this._api.createTopic(DUMMY_CANCELLATION_TOKEN, topicData);

			return res
				.status(201)
				.header("Content-Type", "application/json")
				.end(Buffer.from(JSON.stringify({
					name: topic.topicDomain !== null ? `${topic.topicName}.${topic.topicDomain}` : topic.topicName,
					mediaType: topic.topicMediaType,
					description: topic.topicDescription,
					createAt: topic.createAt.toISOString(),
					deleteAt: topic.deleteAt !== null ? topic.deleteAt.toISOString() : null
				}), "utf-8"));
		} catch (error) {
			return endpointHandledException(res, error);
		}

	}

	private async listTopics(req: express.Request, res: express.Response): Promise<void> {
		try {
			const domain: string | null = null; // TODO get from CN of the cert

			const topics: Array<Topic> = await this._api.listTopics(DUMMY_CANCELLATION_TOKEN, domain);

			const responseData = topics.map(topic => ({
				name: topic.topicDomain !== null ? `${topic.topicName}.${topic.topicDomain}` : topic.topicName,
				mediaType: topic.topicMediaType,
				description: topic.topicDescription,
				createAt: topic.createAt.toISOString(),
				deleteAt: topic.deleteAt !== null ? topic.deleteAt.toISOString() : null
			}));

			res.status(200).end(JSON.stringify(responseData), "utf-8");
		} catch (error) {
			return endpointHandledException(res, error);
		}
	}

	// private async destroyTopic(req: express.Request, res: express.Response): Promise<void> {

	// 	const topicName = req.params.name;
	// 	const kind = req.body.topicSecurityKind;
	// 	const token = req.body.topicSecurityToken;

	// 	if (!topicName || !kind || !token) {
	// 		const message = {
	// 			error: "required parameters",
	// 			message: "[name, topicSecurityKind, topicSecurityToken] is missing"
	// 		};

	// 		return res
	// 			.status(400)
	// 			.header("Content-Type", "application/json")
	// 			.end(JSON.stringify(message));
	// 	}

	// 	const topic: Topic.Id & TopicSecurity = {
	// 		topicName,
	// 		topicDomain: null,
	// 		topicSecurity: { kind, token }
	// 	};

	// 	try {

	// 		await this._api.destroyTopic(DUMMY_CANCELLATION_TOKEN, topic);

	// 		return res.writeHead(200, "Delete").end();

	// 	} catch (error) {
	// 		return endpointHandledException(res, error);
	// 	}
	// }
}

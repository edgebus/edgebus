import { CancellationToken, Logger } from "@zxteam/contract";
import * as hosting from "@zxteam/hosting";

import * as express from "express";
import * as bodyParser from "body-parser";

import { PublisherApi } from "../api/PublisherApi";

export class PublisherApiRestEndpoint extends hosting.ServersBindEndpoint {
	private readonly _api: PublisherApi;

	public constructor(
		servers: ReadonlyArray<hosting.WebServer>,
		api: PublisherApi,
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

			router.post("/", safeBinder(this.publishMessage.bind(this)));
			router.get("/:messageId", safeBinder(this.getMessage.bind(this)));
			router.delete("/:messageId", safeBinder(this.cancelMessage.bind(this)));
		}
	}

	protected onDispose(): void {
		//
	}

	private async cancelMessage(req: express.Request, res: express.Response): Promise<void> {
		//this._api.cancelMessage(....);

		return res.writeHead(500, "Not implemented yet").end();
	}
	private async getMessage(req: express.Request, res: express.Response): Promise<void> {
		//this._api.getMessage(....);

		return res.writeHead(500, "Not implemented yet").end();
	}
	private async publishMessage(req: express.Request, res: express.Response): Promise<void> {
		//this._api.publishMessage(....);

		return res.writeHead(500, "Not implemented yet").end();
	}
}

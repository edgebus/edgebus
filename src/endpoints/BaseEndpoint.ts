import { Logger } from "@zxteam/contract";
import { InvalidOperationError } from "@zxteam/errors";
import { Configuration as HostingConfiguration, ServersBindEndpoint, WebServer } from "@zxteam/hosting";

import * as express from "express";

export class BaseEndpoint extends ServersBindEndpoint {
	protected readonly _router: express.Router;
	protected readonly _rootRouter: express.Router;

	public constructor(servers: ReadonlyArray<WebServer>, opts: HostingConfiguration.BindEndpoint, log: Logger) {
		super(servers, opts, log);
		this._router = express.Router({ strict: true });
		this._rootRouter = express.Router({ strict: true });

		this._router.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
			if (this.disposing || this.disposed) {
				return res.writeHead(503, "Service temporary unavailable. Going to maintenance...").end();
			} else {
				next();
			}
		});
	}

	protected onInit(): void {
		for (const server of this._servers) {
			const rootExpressApplication = server.rootExpressApplication;
			rootExpressApplication.use(this._bindPath, this._router);
			rootExpressApplication.use(this._rootRouter);
		}
	}

	protected onDispose(): void {
		//
	}
}


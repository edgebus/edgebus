import { Logger, CancellationToken } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { Container, Provides, Singleton } from "@zxteam/launcher";
import { logger } from "@zxteam/logger";
import * as hosting from "@zxteam/hosting";

import * as express from "express";
import * as _ from "lodash";

import { ConfigurationProvider } from "./ConfigurationProvider";

@Singleton
export abstract class HostingProvider extends Initable {
	public abstract get serverInstances(): ReadonlyArray<HostingProvider.ServerInstance>;

	protected readonly log: Logger;

	public constructor() {
		super();
		this.log = logger.getLogger("Hosting");
		if (this.log.isDebugEnabled) {
			this.log.debug(`Implementation: ${this.constructor.name}`);
		}
	}
}
export namespace HostingProvider {
	export interface ServerInstance {
		readonly name: string;
		readonly server: hosting.WebServer;
		readonly isOwnInstance: boolean;
	}
}

@Provides(HostingProvider)
class HostingProviderImpl extends HostingProvider {
	// Do not use Inject inside providers to prevents circular dependency
	private readonly _configProvider: ConfigurationProvider;

	private readonly _serverInstances: Array<{ name: string, server: hosting.WebServer, isOwnInstance: boolean }>;
	private readonly _destroyHandlers: Array<() => Promise<void>>;

	public constructor() {
		super();

		this.log.info("Constructing Web servers...");

		this._configProvider = Container.get(ConfigurationProvider);

		this._serverInstances = this._configProvider.servers.map((serverOpts) => {
			if (hosting.instanceofWebServer(serverOpts)) {
				return { name: serverOpts.name, server: serverOpts, isOwnInstance: false };
			}

			const ownServerInstance = hosting.createWebServer(serverOpts, this.log);

			const expressApplication = ownServerInstance.rootExpressApplication;
			expressApplication.enable("case sensitive routing"); // "/Foo" and "/foo" should be different routes
			expressApplication.enable("strict routing"); // the router should treat "/foo" and "/foo/" as different.

			if (!("NODE_ENV" in process.env) || process.env.NODE_ENV === "production") {
				expressApplication.set("env", "production"); // by default use production mode
				expressApplication.disable("x-powered-by"); // Hide real www server (security reason)
			} else {
				expressApplication.set("json spaces", 4);
			}

			return Object.freeze({ name: ownServerInstance.name, server: ownServerInstance, isOwnInstance: true });
		});
		this._destroyHandlers = [];
	}

	public get serverInstances(): ReadonlyArray<HostingProvider.ServerInstance> {
		return Object.freeze(this._serverInstances);
	}


	protected async onInit(cancellationToken: CancellationToken): Promise<void> {
		this.log.info("Initializing Web servers...");

		const serversMap: { readonly [serverName: string]: { server: hosting.WebServer, isOwnInstance: boolean } }
			= _.keyBy(this._serverInstances, "name");

		try {
			for (const serverInfo of _.values(serversMap)) {
				if (this.log.isInfoEnabled) {
					this.log.info(`Start server: ${serverInfo.server.name}`);
				}
				if (serverInfo.isOwnInstance === true) {
					setupExpressErrorHandles(serverInfo.server.rootExpressApplication, this.log);
				}
				await serverInfo.server.init(cancellationToken);
				this._destroyHandlers.push(() => serverInfo.server.dispose());
			}
		} catch (e) {
			let destroyHandler;
			while ((destroyHandler = this._destroyHandlers.pop()) !== undefined) {
				await destroyHandler();
			}
			throw e;
		}

	}

	protected async onDispose(): Promise<void> {
		this.log.info("Disposinig Web servers...");
		let destroyHandler;
		while ((destroyHandler = this._destroyHandlers.pop()) !== undefined) {
			await destroyHandler();
		}
	}
}



export function setupExpressErrorHandles(app: express.Application, log: Logger): void {
	// 404 Not found (bad URL)
	app.use(function (req: express.Request, res: express.Response) { res.status(404).end("404 Not Found"); });

	// 5xx Fatal error
	app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction): any {
		if (err) {
			//TODO: send email, log err, etc...
			log.error(err);
		}
		//return res.status(500).end("500 Internal Error");
		return next(err); // use express exception render
	});
}

import { FLogger, FCancellationToken, FInitableBase, FExecutionContext } from "@freemework/common";
import { Container, Provides, Singleton } from "typescript-ioc";
import * as hosting from "@freemework/hosting";

import * as express from "express";
import * as _ from "lodash";

import { SettingsProvider } from "./settings_provider";
import { ProviderLocator } from "../provider_locator";

@Singleton
export abstract class HostingProvider extends FInitableBase {
	public abstract get serverInstances(): ReadonlyArray<HostingProvider.ServerInstance>;

	protected readonly log: FLogger;

	public constructor() {
		super();
		this.log = FLogger.create(HostingProvider.name);
		if (this.log.isDebugEnabled) {
			this.log.debug(FExecutionContext.Empty, `Implementation: ${this.constructor.name}`);
		}
	}
}
export namespace HostingProvider {
	export interface ServerInstance {
		readonly name: string;
		readonly server: hosting.FWebServer;
		readonly isOwnInstance: boolean;
	}
}

@Provides(HostingProvider)
class HostingProviderImpl extends HostingProvider {
	// Do not use Inject inside providers to prevents circular dependency
	private readonly _configProvider: SettingsProvider;

	private readonly _serverInstances: Array<{ name: string, server: hosting.FWebServer, isOwnInstance: boolean }>;
	private readonly _destroyHandlers: Array<() => Promise<void>>;

	public constructor() {
		super();

		this.log.info(FExecutionContext.Empty, "Constructing Web servers...");

		this._configProvider = ProviderLocator.default.get(SettingsProvider);

		this._serverInstances = this._configProvider.servers.map((serverOpts) => {
			if (hosting.instanceofWebServer(serverOpts)) {
				this.log.debug(FExecutionContext.Empty, () => `Use Web server '${serverOpts.name}' ...`);
				return { name: serverOpts.name, server: serverOpts, isOwnInstance: false };
			}

			const ownServerInstance = hosting.createWebServer(serverOpts);

			const expressApplication = ownServerInstance.rootExpressApplication;
			expressApplication.enable("case sensitive routing"); // "/Foo" and "/foo" should be different routes
			expressApplication.enable("strict routing"); // the router should treat "/foo" and "/foo/" as different.

			if (!("NODE_ENV" in process.env) || process.env.NODE_ENV === "production") {
				expressApplication.set("env", "production"); // by default use production mode
				expressApplication.disable("x-powered-by"); // Hide real www server (security reason)
			} else {
				expressApplication.set("json spaces", 4);
			}

			this.log.debug(FExecutionContext.Empty, () => `Created own Web server '${ownServerInstance.name}' ...`);

			return Object.freeze({ name: ownServerInstance.name, server: ownServerInstance, isOwnInstance: true });
		});
		this._destroyHandlers = [];
	}

	public get serverInstances(): ReadonlyArray<HostingProvider.ServerInstance> {
		return Object.freeze(this._serverInstances);
	}


	protected async onInit(): Promise<void> {
		this.log.info(this.initExecutionContext, "Initializing Web servers...");

		const serversMap: { readonly [serverName: string]: { server: hosting.FWebServer, isOwnInstance: boolean } }
			= _.keyBy(this._serverInstances, "name");

		try {
			for (const serverInfo of _.values(serversMap)) {
				if (this.log.isInfoEnabled) {
					this.log.info(this.initExecutionContext, `Start server: ${serverInfo.server.name}`);
				}
				if (serverInfo.isOwnInstance === true) {
					setupExpressErrorHandles(serverInfo.server.rootExpressApplication, this.log);
				}
				await serverInfo.server.init(this.initExecutionContext);
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
		this.log.info(this.initExecutionContext, "Disposing Web servers...");
		let destroyHandler;
		while ((destroyHandler = this._destroyHandlers.pop()) !== undefined) {
			await destroyHandler();
		}
	}
}



export function setupExpressErrorHandles(app: express.Application, log: FLogger): void {
	// 404 Not found (bad URL)
	app.use(function (req: express.Request, res: express.Response) {
		log.info(req.executionContext, "404 Not Found");
		res.status(404).end("404 Not Found");
	});

	// 5xx Fatal error
	app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction): any {
		if (err) {
			//TODO: send email, log err, etc...
			log.error(req.executionContext, () => `${err}`);
			// log.error(req.executionContext, `${err}`);
		}
		//return res.status(500).end("500 Internal Error");
		return next(err); // use express exception render
	});
}

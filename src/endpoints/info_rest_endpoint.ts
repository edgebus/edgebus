import { FLogger } from "@freemework/common";
import { FWebServer } from "@freemework/hosting";
import { Container } from "typescript-ioc";

import * as express from "express";

import { BaseRestEndpoint, HttpGet } from "./base_rest_endpoint";
import { Settings } from "../settings";
import { BuildInfoProvider } from "../provider/build_info_provider";

export class InfoRestEndpoint extends BaseRestEndpoint {
	private readonly _buildInfo: BuildInfoProvider;

	public constructor(
		servers: ReadonlyArray<FWebServer>,
		opts: Settings.BaseRestEndpoint,
		log: FLogger,
	) {
		super(servers, opts);
		this._buildInfo = Container.get(BuildInfoProvider);
	}

	// protected setupBodyObjectParser(): void {
	// 	//Skip
	// }

	// protected setupBodyRawParser(): void {
	// 	//Skip
	// }

	// protected setupMonitoring(): void {
	// 	//Skip
	// }

	@HttpGet("/")
	private async _getInfo(req: express.Request, res: express.Response): Promise<void> {
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(this._buildInfo, null, "\t"));
	}
}

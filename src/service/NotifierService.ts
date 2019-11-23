import { Logger, CancellationToken } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { Inject } from "@zxteam/launcher";
import { logger } from "@zxteam/logger";

import * as _ from "lodash";

export class NotifierService {
	//
}

export namespace NotifierService {
	export interface Opts {
		readonly cacheStorageURL: URL;
		readonly persistentStorageURL: URL;
	}
}

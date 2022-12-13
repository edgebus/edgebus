export class NotifierService {
	//
}

export namespace NotifierService {
	export interface Opts {
		readonly cacheStorageURL: URL;
		readonly persistentStorageURL: URL;
	}
}

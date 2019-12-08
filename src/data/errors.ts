import { InnerError } from "@zxteam/errors";
import { Logger } from "@zxteam/logger";

export abstract class PersistentStorageError extends InnerError { }

/**
 * There is no connection with the database (miss network, lags, disconnection)
 */
export class ConnectionPersistentStorageError extends PersistentStorageError { }

/**
 * Unknown error type.
 */
export class UnknownPersistentStorageError extends PersistentStorageError { }


/**
 * The user requested data that is not in the database
 */
export class NoRecordPersistentStorageError extends PersistentStorageError { }


export function storageHandledException(error: any): Error {
	throw new NoRecordPersistentStorageError();
}

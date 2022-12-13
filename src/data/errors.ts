import { FException, FExceptionNativeObjectWrapper, FSqlExceptionConstraint, FSqlExceptionNoSuchRecord } from "@freemework/common";
// import { SqlConstraintError, SqlNoSuchRecordError } from "@zxteam/sql";

export abstract class PersistentStorageError extends FException { }

/**
 * There is no connection with the database (miss network, lags, disconnection)
 */
export class ConnectionPersistentStorageError extends PersistentStorageError { }

export class DataIntegrityPersistentStorageError extends PersistentStorageError { }

/**
 * Unknown error type.
 */
export class UnknownPersistentStorageError extends PersistentStorageError { }

/**
 * The user requested data that is not in the database
 */
export class NoRecordPersistentStorageError extends PersistentStorageError { }

export function storageHandledException(error: any): Error {

	if (error instanceof FSqlExceptionConstraint) {
		throw new DataIntegrityPersistentStorageError("Data integrity violation detected.", error);
	}

	if (error instanceof Error) {
		const innerError: any = error;
		if ("code" in innerError) {
			if (innerError.code === "28P01") {
				throw new ConnectionPersistentStorageError("Password authentication failed", FException.wrapIfNeeded(error));
			}
			if (innerError.code === "ECONNREFUSED") {
				throw new ConnectionPersistentStorageError("Don't have connection for db", FException.wrapIfNeeded(error));
			}
		}
	}

	if (error instanceof FSqlExceptionNoSuchRecord) {
		if (error.innerException) {
			const innerError: FException = error.innerException;
			if (innerError instanceof FExceptionNativeObjectWrapper && "code" in innerError.nativeObject && innerError.nativeObject.code === "23505") {
				throw new UnknownPersistentStorageError("Duplicate key value violates unique constraint", error);
			}
		}
		throw new NoRecordPersistentStorageError("No records", error);
	}

	throw new UnknownPersistentStorageError(error.message, error);
}

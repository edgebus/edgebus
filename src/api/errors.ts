import { FException } from "@freemework/common";
import {
	ConnectionPersistentStorageError,
	UnknownPersistentStorageError,
	NoRecordPersistentStorageError
} from "../data/errors";

export abstract class ApiError extends FException { }

export class ServiceUnavailableApiError extends ApiError { }

export class WrongArgumentApiError extends ApiError { }

export class UnknownApiError extends ApiError { }

export function apiHandledException(error: any): Error {

	if (error instanceof NoRecordPersistentStorageError) {
		throw new WrongArgumentApiError(error.message, error);
	}
	if (error instanceof ConnectionPersistentStorageError) {
		throw new ServiceUnavailableApiError(error.message, error);
	}
	if (error instanceof UnknownPersistentStorageError) {
		throw new UnknownApiError(error.message, error);
	}

	throw new UnknownApiError("Unkwon error", error);
}

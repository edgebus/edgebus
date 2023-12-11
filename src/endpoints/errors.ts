import { FEnsureException, FException } from "@freemework/common";

import * as express from "express";

import { DataIntegrityPersistentStorageError } from "../data/errors";
import { ApiError } from "../api/errors";

export abstract class EndpointError extends FException { }

export function endpointHandledException(res: express.Response, error: any) {

	if (error instanceof FEnsureException) {
		return res.writeHead(400, `Bad Request: ${error.message}`).end();
	}
	// if (error instanceof SqlNoSuchRecordError) {
	// 	return res.writeHead(404, "No data").end();
	// }
	if (
		error instanceof ApiError &&
		error.innerException instanceof DataIntegrityPersistentStorageError
	) {
		return res.writeHead(400, "Bad request").end();
	}
	// if (error instanceof ForbiddenPersistentStorageError) {
	// 	return res.writeHead(403, "Forbidden").end();
	// }

	return res.writeHead(500, "Unhandled exception").end();
}

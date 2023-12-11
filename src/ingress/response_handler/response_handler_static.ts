import { FExecutionContext } from "@freemework/common";

import { Message } from "../../model";

import { ResponseHandlerBase } from "./response_handler_base";

export class ResponseHandlerStatic extends ResponseHandlerBase {
	public constructor(
		private readonly _responseStatusCode: number,
		private readonly _responseStatusMessage: string | null,
		private readonly _responseHeaders: Readonly<Record<string, string | null>> | null,
		private readonly _responseBody: Uint8Array | null,
	) {
		super();
	}

	public execute(
		executionContext: FExecutionContext,
		message: Message.Data
	): Promise<{
		readonly headers: Readonly<Record<string, string | null>> | null;
		readonly statusCode: number;
		readonly statusDescription: string | null;
		readonly body: Uint8Array | null;
	}> {
		return Promise.resolve(Object.freeze({
			headers: this._responseHeaders,
			body: this._responseBody,
			statusCode: this._responseStatusCode,
			statusDescription: this._responseStatusMessage,
		}));
	}
}

import { FCancellationExecutionContext, FCancellationToken, FExecutionContext, FLogger, FLoggerLabelsExecutionContext } from "@freemework/common";
import { FAbstractWebServer } from "@freemework/hosting";

import * as express from "express";
import { v4 as uuid } from "uuid";

declare module "express-serve-static-core" {
	interface Request {
		getExecutionContext(): FExecutionContext;
	}
}

export function executionContextMiddleware(baseExecutionContext: FExecutionContext, logger: FLogger, req: express.Request, res: express.Response, next: express.NextFunction): void {
	const cancellationToken: FCancellationToken = FAbstractWebServer.createFCancellationToken(req);

	const method: string = req.method.toUpperCase();

	let executionContext = baseExecutionContext;
	executionContext = new FCancellationExecutionContext(executionContext, cancellationToken, true);
	executionContext = new FLoggerLabelsExecutionContext(executionContext, {
		"requestId": `req_${uuid().split('-').join('')}`,
		"httpMethod": method,
		"httpPath": req.originalUrl
	});

	(req as any)._executionContext = executionContext;

	logger.debug((req as any)._executionContext, "Begin HTTP request");

	const originalEnd: (chunk: any, encoding: BufferEncoding, cb?: (() => void) | undefined) => express.Response = res.end;
	res.end = (chunk?: any, encodingOrCb?: BufferEncoding | Function, cb?: () => void) => {
		const statusCode: number = res.statusCode;

		(req as any)._executionContext = new FLoggerLabelsExecutionContext(executionContext, {
			"httpStatus": statusCode.toString()
		});

		logger.info((req as any)._executionContext, () => `${statusCode} ${method} ${req.originalUrl} HTTP/${req.httpVersion}`);
		logger.debug((req as any)._executionContext, "End HTTP request");

		return originalEnd.call(res, chunk, encodingOrCb as BufferEncoding, cb as () => void);
	};

	req.getExecutionContext = function () {
		return (req as any)._executionContext;
	}

	next();
}



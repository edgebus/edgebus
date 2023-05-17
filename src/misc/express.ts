import { FCancellationExecutionContext, FCancellationToken, FExecutionContext, FLogger, FLoggerLabelsExecutionContext } from "@freemework/common";
import { FAbstractWebServer } from "@freemework/hosting";

import * as express from "express";
import { v4 as uuid } from "uuid";

declare module "express-serve-static-core" {
	interface Request {
		executionContext: FExecutionContext;
	}
}

export type ExecutionContextMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => void;

export function createExecutionContextMiddleware(logger: FLogger, baseExecutionContext: FExecutionContext): ExecutionContextMiddleware {
	const middleware: ExecutionContextMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
		const cancellationToken: FCancellationToken = FAbstractWebServer.createFCancellationToken(req);

		const method: string = req.method.toUpperCase();

		req.executionContext = baseExecutionContext;
		req.executionContext = new FCancellationExecutionContext(req.executionContext, cancellationToken, true);
		req.executionContext = new FLoggerLabelsExecutionContext(req.executionContext, {
			"requestId": `req_${uuid().split('-').join('')}`,
			"httpMethod": method,
			"httpPath": req.originalUrl
		});

		logger.debug(req.executionContext, "Begin HTTP request");

		const originalEnd: (chunk: any, encoding: BufferEncoding, cb?: (() => void) | undefined) => express.Response = res.end;
		res.end = (chunk?: any, encodingOrCb?: BufferEncoding | Function, cb?: () => void) => {
			const statusCode: number = res.statusCode;

			req.executionContext = new FLoggerLabelsExecutionContext(req.executionContext, {
				"httpStatus": statusCode.toString()
			});

			logger.info(req.executionContext, () => `${statusCode} ${method} ${req.originalUrl} HTTP/${req.httpVersion}`);
			logger.debug(req.executionContext, "End HTTP request");

			return originalEnd.call(res, chunk, encodingOrCb as BufferEncoding, cb as () => void);
		};

		next();
	}

	return middleware;
}



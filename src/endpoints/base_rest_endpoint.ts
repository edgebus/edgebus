import { FCancellationToken, FException, FExceptionInvalidOperation, FExecutionContext, FCancellationExecutionContext, FLoggerLabelsExecutionContext, FLogger } from "@freemework/common";

import { FAbstractWebServer, FHostingConfiguration, FServersBindEndpoint, FWebServer } from "@freemework/hosting";

import * as express from "express";
import { PathParams } from "express-serve-static-core";
import * as _ from "lodash";
import { v4 as uuid } from "uuid";

import { Settings } from "../settings";
import { Bind } from "../utils/bind";
import { MIME_APPLICATION_JSON } from "../utils/mime";

declare module "express-serve-static-core" {
	interface Request {
		executionContext: FExecutionContext;
	}
}

export class BaseRestEndpoint extends FServersBindEndpoint {
	protected readonly _router: express.Router;
	// protected readonly _rootRouter: express.Router;
	protected readonly _logger: FLogger;

	public constructor(
		servers: ReadonlyArray<FWebServer>,
		opts: Settings.BaseRestEndpoint
	) {
		super(servers, opts);
		this._logger = FLogger.create(this.constructor.name);
		// this._monitoring = ProviderLocator.default.get(MonitoringProvider);
		// this._cors = opts.cors;
		this._router = express.Router();
		// this._rootRouter = express.Router({ strict: true });
		this._router.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
			if (this.disposing || this.disposed) {
				return res.writeHead(503, "Service temporary unavailable. Going to maintenance...").end();
			} else {
				next();
			}
		});
		// this.setupMonitoring();
		// this._router.use(this._middlewareWriteHeadAdapter);
		// this.setupCors();
		// this.setupBodyRawParser();
		// this.setupBodyObjectParser();
		this.setupExecutionContext();
	}

	// public constructor(servers: ReadonlyArray<FWebServer>, opts: FHostingConfiguration.BindEndpoint, log: FLogger) {
	// 	super(servers, opts);
	// 	this._log = log;
	// 	this._router = express.Router({ strict: true });

	// 	this._router.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	// 		if (this.disposing || this.disposed) {
	// 			return res.writeHead(503, "Service temporary unavailable. Going to maintenance...").end();
	// 		} else {
	// 			next();
	// 		}
	// 	});
	// }

	protected onInit(): void {
		const classHttpMeta: ClassHttpMeta = __getClassHttpMeta(this.constructor);
		for (const [jsMethod, httpMeta] of classHttpMeta) {
			const handler: Function = (this as any)[jsMethod];
			if (!(_.isFunction(handler) && handler.length === 2)) {
				throw new FExceptionInvalidOperation("BUG Detected. Decorator produces wrong meta data.");
			}
			switch (httpMeta.httpMethod) {
				case "DELETE":
					this._router.delete(httpMeta.path, this.safeBinder(handler.bind(this)));
					break;
				case "GET":
					this._router.get(httpMeta.path, this.safeBinder(handler.bind(this)));
					break;
				case "POST":
					if (httpMeta.requireBodyObject) {
						this._router.post(httpMeta.path, this._middlewareRequireBodyObject, this.safeBinder(handler.bind(this)));
					} else {
						this._router.post(httpMeta.path, this.safeBinder(handler.bind(this)));
					}
					break;
				case "PUT":
					if (httpMeta.requireBodyObject) {
						this._router.put(httpMeta.path, this._middlewareRequireBodyObject, this.safeBinder(handler.bind(this)));
					} else {
						this._router.put(httpMeta.path, this.safeBinder(handler.bind(this)));
					}
					break;

			}
		}

		for (const server of this._servers) {
			const rootExpressApplication = server.rootExpressApplication;
			rootExpressApplication.use(this._bindPath, this._router);
			// rootExpressApplication.use(this._rootRouter);

			if (this._logger.isInfoEnabled) {
				this._logger.info(
					this.initExecutionContext,
					`Endpoint '${this._bindPath}' was assigned to server '${server.name}'.`
				);
			}
		}


		// for (const server of this._servers) {
		// 	const rootExpressApplication = server.rootExpressApplication;
		// 	rootExpressApplication.use(this._bindPath, this._router);
		// 	rootExpressApplication.use(this._rootRouter);
		// }
	}

	protected onDispose(): void {
		// NOP
	}


	protected errorRenderer(executionContext: FExecutionContext, e: FException, res: express.Response): void {
		// this._monitoring.handleError(e);

		// if (e instanceof BadUserDataError) {
		// 	logger.debug(e.message, e);
		// 	res.writeHead(400, `Bad Request. ${e.message}`).end();
		// 	return;
		// }

		// if (e instanceof PermissionError) {
		// 	logger.debug(e.message, e);
		// 	res.writeHead(403, "Forbidden").end();
		// 	return;
		// }

		// if (e instanceof GeneralError) {
		// 	logger.debug(e.message, e);
		// 	if (logger.isWarnEnabled) {
		// 		logger.warn(`GeneralError was happened. ${e.message}`);
		// 	} else {
		// 		console.warn(`GeneralError was happened. ${e.message}`);
		// 	}
		// 	if (logger.isDebugEnabled) {
		// 		logger.debug("GeneralError was happened.", e);
		// 	}
		// 	res.writeHead(503, "Service temporary unavailable").end();
		// 	return;
		// }

		if (this._logger.isWarnEnabled) {
			this._logger.warn(executionContext, `Unhandled error ${this.constructor.name}: ${e.message}`);
		} else {
			console.error(`Unhandled error ${this.constructor.name}: ${e.message}`);
		}
		this._logger.debug(executionContext, () => `Unhandled error ${this.constructor.name}: ${e.message} ${e.stack}`);
		this._logger.trace(executionContext, () => `Unhandled error ${this.constructor.name}: ${e.message} ${e.stack}`, e);

		// if (isProduction()) {
		// res.writeHead(500, `Internal error`).end();
		// } else {
		res.writeHead(500, e.message).end();
		// }
	}

	@Bind
	private _middlewareExecutionContext(req: express.Request, res: express.Response, next: express.NextFunction) {
		const cancellationToken: FCancellationToken = FAbstractWebServer.createFCancellationToken(req);

		const method: string = req.method.toUpperCase();

		req.executionContext = this.initExecutionContext;
		req.executionContext = new FCancellationExecutionContext(req.executionContext, cancellationToken, true);
		req.executionContext = new FLoggerLabelsExecutionContext(req.executionContext, {
			"requestId": `req_${uuid().split('-').join('')}`,
			"httpMethod": method,
			"httpPath": req.originalUrl
		});

		this._logger.debug(req.executionContext, "Begin HTTP request");

		const originalEnd: (chunk: any, encoding: BufferEncoding, cb?: (() => void) | undefined) => express.Response = res.end;
		res.end = (chunk?: any, encodingOrCb?: BufferEncoding | Function, cb?: () => void) => {
			const statusCode: number = res.statusCode;

			req.executionContext = new FLoggerLabelsExecutionContext(req.executionContext, {
				"httpStatus": statusCode.toString()
			});

			this._logger.info(req.executionContext, () => `${statusCode} ${method} ${req.originalUrl} HTTP/${req.httpVersion}`);
			this._logger.debug(req.executionContext, "End HTTP request");

			return originalEnd.call(res, chunk, encodingOrCb as BufferEncoding, cb as () => void);
		};

		next();
	}

	@Bind
	private _middlewareRequireBodyObject(req: express.Request, res: express.Response, next: express.NextFunction) {
		if ("bodyObject" in req && req.bodyObject !== undefined) {
			return next();
		}

		if ("body" in req && req.body !== undefined) {
			return next();
		}

		return res.writeHead(400,
			`Body is missing. Please provide valid JSON object along with a header "Content-Type: ${MIME_APPLICATION_JSON}".`
		).end();
	}

	protected safeBinder(cb: (req: express.Request, res: express.Response) => (void | Promise<void>)) {
		const handler = (req: express.Request, res: express.Response): void => {
			try {
				const result = cb(req, res);
				if (result instanceof Promise) {
					result.catch((e) => this.errorRenderer(req.executionContext, FException.wrapIfNeeded(e), res));
				}
			} catch (e) {
				this.errorRenderer(req.executionContext, FException.wrapIfNeeded(e), res);
			}
		};
		return handler;
	}

	protected setupExecutionContext(): void {
		this._router.use(this._middlewareExecutionContext);
	}
}

/**
 * The error shows developer's issues. If this happens, go to dev team.
 */
export class BrokenEndpointError extends FException {
	//
}

export function HttpGet(expressPath: PathParams): MethodDecorator {

	function decorator(
		target: Object,
		methodName: string | symbol,
		descriptor: TypedPropertyDescriptor<any>
	) {
		const classMeta: ClassHttpMeta = __getClassHttpMeta(target.constructor);
		classMeta.set(methodName, { httpMethod: "GET", path: expressPath });
		return descriptor;
	}

	return decorator;
}

export function HttpPost(expressPath: PathParams, requireBodyObject: boolean = true): MethodDecorator {

	function decorator(
		target: Object,
		methodName: string | symbol,
		descriptor: TypedPropertyDescriptor<any>
	) {
		const classMeta: ClassHttpMeta = __getClassHttpMeta(target.constructor);
		classMeta.set(methodName, Object.freeze({ httpMethod: "POST", path: expressPath, requireBodyObject }));
		return descriptor;
	}

	return decorator;
}

export function HttpPut(expressPath: PathParams, requireBodyObject: boolean = true): MethodDecorator {

	function decorator(
		target: Object,
		methodName: string | symbol,
		descriptor: TypedPropertyDescriptor<any>
	) {
		const classMeta: ClassHttpMeta = __getClassHttpMeta(target.constructor);
		classMeta.set(methodName, Object.freeze({ httpMethod: "PUT", path: expressPath, requireBodyObject }));
		return descriptor;
	}

	return decorator;
}

export function HttpDelete(expressPath: PathParams): MethodDecorator {

	function decorator(
		target: Object,
		methodName: string | symbol,
		descriptor: TypedPropertyDescriptor<any>
	) {
		const classMeta: ClassHttpMeta = __getClassHttpMeta(target.constructor);
		classMeta.set(methodName, { httpMethod: "DELETE", path: expressPath });
		return descriptor;
	}

	return decorator;
}

declare module "express-serve-static-core" {
	interface Request {
		/**
		 * Provides JSON parsed body. This value is set in a BaseRestEndpoint.bodyObjectParser() class.
		 */
		bodyObject?: any;

		bodyRaw?: Buffer;
	}
}


namespace HttpMeta {
	export interface Base {
		readonly httpMethod: string;
		readonly path: PathParams;
	}
	export interface WithoutBody extends Base {
		readonly httpMethod: "GET" | "DELETE";
		// readonly path: PathParams;
	}
	export interface WithBody extends Base {
		readonly httpMethod: "POST" | "PUT";
		// readonly path: PathParams;
		readonly requireBodyObject: boolean;
	}
}
type HttpMeta = HttpMeta.WithoutBody | HttpMeta.WithBody;

type ClassHttpMeta = Map<string | symbol, HttpMeta>;
const __httpMethodsMeta: Map<Object, ClassHttpMeta> = new Map();
function __getClassHttpMeta(target: Object): ClassHttpMeta {
	const classMeta: ClassHttpMeta | undefined = __httpMethodsMeta.get(target);
	if (classMeta !== undefined) { return classMeta; }
	const newClassMeta = new Map();
	__httpMethodsMeta.set(target, newClassMeta);
	return newClassMeta;
}

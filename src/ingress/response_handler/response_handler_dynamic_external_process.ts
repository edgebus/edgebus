import { FEnsure, FEnsureException, FException, FExecutionContext, FLogger, FLoggerLabelsExecutionContext } from "@freemework/common";

import { LabelHandler, Message } from "../../model";

import { ResponseHandlerBase } from "./response_handler_base";
import { ExternalProcess } from "../../utils/external_process";

const ensure: FEnsure = FEnsure.create();

export class ResponseHandlerDynamicExternalProcessException extends FException {
	public constructor(message: string, ex: FException) {
		super(message, ex);
	}
}

export class ResponseHandlerDynamicExternalProcess extends ResponseHandlerBase {
	private readonly timeoutMs;
	private readonly externalProcessPath: LabelHandler.ExternalProcess["externalProcessPath"];
	private readonly log: FLogger;

	constructor(externalProcessPath: LabelHandler.ExternalProcess["externalProcessPath"]) {
		super();
		this.externalProcessPath = externalProcessPath;
		this.timeoutMs = 15 * 1000;
		this.log = FLogger.create(this.constructor.name);
	}

	public async execute(
		executionContext: FExecutionContext,
		message: Message.Id & Message.Data
	): Promise<{
		readonly headers: Readonly<Record<string, string | null>> | null;
		readonly statusCode: number;
		readonly statusDescription: string;
		readonly body: Uint8Array | null;
	}> {
		// const messageBodyJson: string = JSON.stringify(message.messageBody.toString());
		const messageBodyJson: string = message.messageBody.toString();

		const externalProcess: ExternalProcess = ExternalProcess.create(
			this.externalProcessPath,
			this.timeoutMs
		);

		const dataStr = await externalProcess.run(executionContext, messageBodyJson);
		try {
			const dataRaw: any = JSON.parse(dataStr);
			const headers: Record<string, string | null> | null = dataRaw.headers !== null
				? ensure.array(dataRaw.headers)
					.reduce<Record<string, string | null>>((acc, rawHeader) => {
						const header: string = ensure.string(rawHeader);
						const splitIndex: number = header.indexOf(":");
						const headerName: string = splitIndex !== -1 ? header.substring(0, splitIndex) : header;
						const headerValue: string | null = splitIndex !== -1 ? header.substring(0, splitIndex) : header;
						acc[headerName] = headerValue;
						return acc;
					}, {})
				: null;
			const statusCode: number = ensure.number(dataRaw.statusCode);
			const statusDescription = ensure.string(dataRaw.statusDescription);
			const bodyBase64: string | null = dataRaw.bodyBase64 !== null ? ensure.string(dataRaw.bodyBase64) : null;
			return Object.freeze({
				headers,
				statusCode,
				statusDescription,
				body: bodyBase64 !== null
					? Buffer.from(bodyBase64, 'base64')
					: null
			});
		} catch (e) {
			const ex: FException = FException.wrapIfNeeded(e);
			if (ex instanceof FEnsureException) {
				const errMsg = 'Parse error. Expected json in format { "headers": ["...", "...", ...], "statusCode": 200, "statusDescription": "...", "bodyBase64": "...base64body..." }';

				this.log.info(executionContext, errMsg);
				this.log.debug(executionContext, () => `${errMsg}. Received: '${dataStr}'. ${ex.message}`, ex);
				throw new ResponseHandlerDynamicExternalProcessException(errMsg, ex);
			} else {
				throw ex;
			}
		}
	}
}

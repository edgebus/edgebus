import { FEnsure, FEnsureException, FException, FExecutionContext, FLogger } from "@freemework/common";

import * as path from "path";

import { LabelHandler, Message } from "../../model";

import { AbstractResponseHandler } from "./abstract_response_handler";
import { ResponseExternalProcess } from "./response_external_process";
import { ExternalProcessExceptionParse, ExternalProcessException } from "../../utils/abstract_external_process";

const ensure: FEnsure = FEnsure.create();

export class ExternalResponseHandler extends AbstractResponseHandler {
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
		const newExternalProcess: ResponseExternalProcess = new ResponseExternalProcess(
			ExternalResponseHandler.getLabelsHandlerAbsolutePath(this.externalProcessPath),
			this.timeoutMs
		);
		try {
			const dataStr = await newExternalProcess.execute(executionContext, message);
			const dataRaw = JSON.parse(dataStr);
			const headers = dataRaw.headers;
			const statusCode = ensure.number(dataRaw.statusCode);
			const statusDescription = ensure.string(dataRaw.statusDescription);
			const body = ensure.string(dataRaw.body);
			return {
				headers,
				statusCode,
				statusDescription,
				body: Buffer.from(body)
			}
		} catch (e) {
			if (e instanceof FEnsureException) {
				const errMsg = 'Parse error. Expected json array of strings from external label handler.';

				this.log.info(executionContext, errMsg);
				throw new ExternalProcessExceptionParse(errMsg, FException.wrapIfNeeded(e));
			} else {
				const ex = FEnsureException.wrapIfNeeded(e);
				this.log.info(executionContext, ex.message);
				throw new ExternalProcessException(ex);
			}
		}
	}

	private static getLabelsHandlerAbsolutePath(labelHandlerPath: string): string {
		const fullPath = path.isAbsolute(labelHandlerPath)
			? labelHandlerPath
			: path.join(process.cwd(), labelHandlerPath);
		return fullPath;
	}
}

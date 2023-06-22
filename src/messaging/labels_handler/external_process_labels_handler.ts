import { FExecutionContext } from "@freemework/common";
import { LabelHandler, Message } from "../../model";
import { LabelsHandlerBase } from "./labels_handler_base";
import path = require("path");
import { ExternalProcess } from "./external_process";


export class ExternalLabelsHandler extends LabelsHandlerBase {
	private readonly timeoutMs;
	private readonly externalProcessPath: LabelHandler.ExternalProcess["externalProcessPath"];

	constructor(externalProcessPath: LabelHandler.ExternalProcess["externalProcessPath"]) {
		super();
		this.externalProcessPath = externalProcessPath;
		this.timeoutMs = 15 * 1000;
	}

	public execute(
		executionContext: FExecutionContext,
		message: Message.Id & Message.Data
	): Promise<Array<string>> {
		const newExternalProcess = new ExternalProcess(this.getLabelHandlerFullPath(this.externalProcessPath), this.timeoutMs);
		return newExternalProcess.execute(executionContext, message);
	}

	private getLabelHandlerFullPath(labelHandlerPath: string): string {
		const fullPath = path.join(process.cwd(), labelHandlerPath);
		return fullPath;
	}
}

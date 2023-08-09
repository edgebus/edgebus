import { FExecutionContext } from "@freemework/common";

import * as path from "path";

import { Label, LabelHandler, Message } from "../../model";

import { ExternalProcess } from "./external_process";
import { AbstractLabelsHandler } from "./abstract_labels_handler";

export class ExternalLabelsHandler extends AbstractLabelsHandler {
	private readonly timeoutMs;
	private readonly externalProcessPath: LabelHandler.ExternalProcess["externalProcessPath"];

	constructor(externalProcessPath: LabelHandler.ExternalProcess["externalProcessPath"]) {
		super();
		this.externalProcessPath = externalProcessPath;
		this.timeoutMs = 15 * 1000;
	}

	public async execute(
		executionContext: FExecutionContext,
		message: Message.Id & Message.Data
	): Promise<Array<Label["labelValue"]>> {
		const newExternalProcess: ExternalProcess = new ExternalProcess(
			ExternalLabelsHandler.getLabelsHandlerAbsolutePath(this.externalProcessPath),
			this.timeoutMs
		);
		return await newExternalProcess.execute(executionContext, message);
	}

	private static getLabelsHandlerAbsolutePath(labelHandlerPath: string): string {
		const fullPath = path.isAbsolute(labelHandlerPath)
			? labelHandlerPath
			: path.join(process.cwd(), labelHandlerPath);
		return fullPath;
	}
}

import { FEnsure, FExecutionContext, FLogger } from "@freemework/common";
import { LabelHandler, Message } from "../../model";
import { LabelsHandlerBase } from "./labels_handler_base";
import { spawn } from "child_process";
import path = require("path");

const ensure: FEnsure = FEnsure.create();

export class ExternalLabelsHandler extends LabelsHandlerBase {
	private static readonly LABEL_HANDLERS_FOLDER = "label_handlers"

	private readonly externalProcessPath: LabelHandler.ExternalProcess["externalProcessPath"];
	private readonly log: FLogger;

	constructor(externalProcessPath: LabelHandler.ExternalProcess["externalProcessPath"]) {
		super();
		this.externalProcessPath = externalProcessPath;
		this.log = FLogger.create(ExternalLabelsHandler.name);
	}

	public execute(executionContext: FExecutionContext, message: Message): Promise<string[]> {
		return new Promise((res, rej) => {
			const cmd = spawn(this.getLabelHandlerFullPath(this.externalProcessPath));

			cmd.stderr.on('data', (data) => {
				this.log.error(executionContext, data.toString());
			});

			cmd.stdout.on('data', (data) => {
				const result = JSON.parse(data.toString());
				res(ensure.array(result));
			});

			cmd.on('error', (error) => {
				this.log.error(executionContext, error.toString());
				rej(error);
			});

			cmd.stdin?.write(JSON.stringify(message));
			cmd.stdin?.end();
		});
	}

	private getLabelHandlerFullPath(labelHandlerPath: string) {
		const fullPath = path.join(process.cwd(), ExternalLabelsHandler.LABEL_HANDLERS_FOLDER, labelHandlerPath);
		return fullPath;
	}
}

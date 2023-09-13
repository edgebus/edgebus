import { FEnsure, FEnsureException, FException, FExecutionContext } from "@freemework/common";

import { Label, LabelHandler, Message } from "../../model";

import { AbstractLabelsHandler } from "./abstract_labels_handler";
import { ExternalProcess } from "../../utils/external_process";

const ensure: FEnsure = FEnsure.create();

export class ExternalLabelsHandlerException extends FException {
	public constructor(message: string, ex: FException) {
		super(message, ex);
	}
}

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
		const newExternalProcess: ExternalProcess = ExternalProcess.create(
			this.externalProcessPath,
			this.timeoutMs
		);

		const msgBodyStr: string = message.messageBody.toString();

		const resultStr: string = await newExternalProcess.run(executionContext, msgBodyStr);

		try {
			const dataRaw = JSON.parse(resultStr);
			const data: Array<any> = ensure.array(dataRaw);
			const result: Array<string> = data.map(label => ensure.string(label));
			return result;
		} catch (e) {
			if (e instanceof FEnsureException) {
				const errMsg = 'Parse error. Expected json array of strings from external label handler.';
				throw new ExternalLabelsHandlerException(errMsg, FException.wrapIfNeeded(e));
			}
			throw e;
		}
	}
}

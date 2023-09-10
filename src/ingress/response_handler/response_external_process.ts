import { FExecutionContext } from "@freemework/common";
import { Message } from "../../model";
import { AbstractExternalProcess } from "../../utils/abstract_external_process";

export class ResponseExternalProcess extends AbstractExternalProcess {
	constructor(executablePath: string, timeoutMs: number) {
		super(executablePath, timeoutMs);
	}

	public async execute(executionContext: FExecutionContext, message: Message.Id & Message.Data): Promise<any> {
		const dataRaw = this.executeRaw(executionContext, message);
		return dataRaw;
	}
}

import { Message } from "../../model";
import { FExecutionContext } from "@freemework/common";


export abstract class LabelsHandlerBase {
	public abstract execute(executionContext: FExecutionContext, message: Message.Id & Message.Data): Promise<Array<string>>;
}

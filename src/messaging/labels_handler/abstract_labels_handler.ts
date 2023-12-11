import { Label, Message } from "../../model";
import { FExecutionContext } from "@freemework/common";

export abstract class AbstractLabelsHandler {
	public abstract execute(
		executionContext: FExecutionContext,
		message: Message.Id & Message.Data
	): Promise<Array<Label["labelValue"]>>;
}

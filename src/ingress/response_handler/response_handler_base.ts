import { Message } from "../../model";
import { FExecutionContext } from "@freemework/common";

export abstract class ResponseHandlerBase {
	public abstract execute(
		executionContext: FExecutionContext,
		message: Message.Data
	): Promise<{
		readonly headers: Readonly<Record<string, string | null>> | null;
		readonly statusCode: number;
		readonly statusDescription: string | null;
		readonly body: Uint8Array | null;
	}>;
}

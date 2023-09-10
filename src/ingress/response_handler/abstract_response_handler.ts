import { Message } from "../../model";
import { FExecutionContext } from "@freemework/common";

export abstract class AbstractResponseHandler {
	public abstract execute(
		executionContext: FExecutionContext,
		message: Message.Data
	): Promise<{
		readonly headers: Readonly<Record<string, string | null>> | null;
		readonly statusCode: number;
		readonly statusDescription: string;
		readonly body: Uint8Array | null;
	}>;
}

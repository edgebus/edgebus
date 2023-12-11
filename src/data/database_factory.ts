import { FExecutionContext } from "@freemework/common";

import { Database } from "./database";

export abstract class DatabaseFactory {
	public abstract create(executionContext: FExecutionContext): Promise<Database>;
	public abstract using<TResult>(executionContext: FExecutionContext, worker: (db: Database) => Promise<TResult>): Promise<TResult>;
}


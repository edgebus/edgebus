import { FException, FExceptionAggregate, FExecutionContext, FInitable, FInitableMixin, FLogger, FUsing } from "@freemework/common";
import { FSqlConnectionFactoryPostgres } from "@freemework/sql.postgres";


import appInfo from "../../utils/app_info";

import { Database } from "../database";
import { DatabaseFactory } from "../database_factory";

import { PostgresDatabase } from "./postgres_database";
import { Bind } from "../../utils/bind";

export class PostgresDatabaseFactory extends DatabaseFactory implements FInitable {
	public constructor(sqlConnectionUrl: URL) {
		super();
		this._sqlConnectionUrl = sqlConnectionUrl;
		this._log = FLogger.create(PostgresDatabaseFactory.name);

		this._sqlConnectionFactory = new FSqlConnectionFactoryPostgres({
			url: this._sqlConnectionUrl,
			log: FLogger.create(`${PostgresDatabase.name}.PostgreSQL`),
			applicationName: `${appInfo.title} v${appInfo.version}`
		});
	}

	@Bind
	public async create(executionContext: FExecutionContext): Promise<Database> {
		const db: PostgresDatabase = new PostgresDatabase(this._sqlConnectionFactory);
		await db.init(executionContext);
		return db;
	}

	public using<TResult>(executionContext: FExecutionContext, worker: (db: Database) => Promise<TResult>): Promise<TResult> {
		return FUsing(executionContext, this.create, async (db: Database) => {
			try {
				const workerResult = await worker(db);
				await db.transactionCommit(executionContext);
				return workerResult;
			} catch (e) {
				try { await db.transactionRollback(executionContext); }
				catch (rollbackEx) {
					throw new FExceptionAggregate([
						FException.wrapIfNeeded(e),
						FException.wrapIfNeeded(rollbackEx)
					]);
				}
				throw e;
			}
		});
	}

	protected async onInit(): Promise<void> {
		await this._sqlConnectionFactory.init(this.initExecutionContext)
	}

	protected async onDispose(): Promise<void> {
		await this._sqlConnectionFactory.dispose();
	}

	private readonly _sqlConnectionFactory: FSqlConnectionFactoryPostgres;
	private readonly _log: FLogger;
	private readonly _sqlConnectionUrl: URL;
}
export interface PostgresDatabaseFactory extends FInitableMixin { }
FInitableMixin.applyMixin(PostgresDatabaseFactory);

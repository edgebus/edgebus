import { FException, FExceptionAggregate, FExecutionContext, FInitable, FInitableMixin, FLogger, Fusing } from "@freemework/common";
import { FSqlConnectionFactoryPostgres } from "@freemework/sql.postgres";


import appInfo from "../../utils/app_info";

import { Database } from "../database";
import { DatabaseFactory } from "../database_factory";

import { PostgresDatabase } from "./postgres_database";

export class PostgresDatabaseFactory extends DatabaseFactory implements FInitable {
	public constructor(sqlConnectionUrl: URL) {
		super();
		this._sqlConnectionUrl = sqlConnectionUrl;
		this._log = FLogger.create(PostgresDatabaseFactory.name);
		this._createBound = this.create.bind(this);

		this._sqlConnectionFactory = new FSqlConnectionFactoryPostgres({
			url: this._sqlConnectionUrl,
			log: FLogger.create(`${PostgresDatabase.name}.PostgreSQL`),
			applicationName: `${appInfo.title} v${appInfo.version}`
		});
	}

	public async create(executionContext: FExecutionContext): Promise<Database> {
		const db: PostgresDatabase = new PostgresDatabase(this._sqlConnectionFactory);
		await db.init(executionContext);
		return db;
	}

	public using<TResult>(executionContext: FExecutionContext, worker: (db: Database) => Promise<TResult>): Promise<TResult> {
		return Fusing(executionContext, this._createBound, async (db: Database) => {
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
	private readonly _createBound: Fusing.ResourceInitializerWithExecutionContext<Database>;
}
export interface PostgresDatabaseFactory extends FInitableMixin { }
FInitableMixin.applyMixin(PostgresDatabaseFactory);

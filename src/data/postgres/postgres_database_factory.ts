import { FException, FExceptionAggregate, FExecutionContext, FInitable, FInitableMixin, FLogger, FUsing } from "@freemework/common";
import { FSqlConnectionFactoryPostgres } from "@freemework/sql.postgres";


import packageInfo from "../../utils/package_info";

import { Database } from "../database";
import { DatabaseFactory } from "../database_factory";

import { PostgresDatabase } from "./postgres_database";
import { Bind } from "../../utils/bind";
import { MaskService } from "../../misc/mask_service";

export class PostgresDatabaseFactory extends DatabaseFactory implements FInitable {
	public constructor(sqlConnectionUrl: URL) {
		super();
		this._sqlConnectionUrl = sqlConnectionUrl;
		this._log = FLogger.create(PostgresDatabaseFactory.name);

		this._sqlConnectionFactory = new FSqlConnectionFactoryPostgres({
			url: this._sqlConnectionUrl,
			log: FLogger.create(`${PostgresDatabase.name}.PostgreSQL`),
			applicationName: `${packageInfo.title} v${packageInfo.version}`
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
		const executionContext: FExecutionContext = this.initExecutionContext;

		const maskedConnectionString: string = MaskService.DEFAULT.maskUri(this._sqlConnectionUrl).toString();
		this._log.info(executionContext, `Initializing Postgres connection ${maskedConnectionString}`);
		try {
			await this._sqlConnectionFactory.init(executionContext);
		} catch (e) {
			const err: FException = FException.wrapIfNeeded(e);
			this._log.error(executionContext, `Failure initialize Postgres connection ${maskedConnectionString}. Inner message: ${err.message}`);
			throw err; // re-throw
		}
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

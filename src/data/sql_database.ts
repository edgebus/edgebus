import { FCancellationExecutionContext, FCancellationToken, FException, FExceptionAggregate, FExceptionInvalidOperation, FExecutionContext, FLogger, FSqlConnection, FSqlConnectionFactory } from "@freemework/common";

import { Database } from "./database";

export abstract class SqlDatabase extends Database {
	public constructor(sqlConnectionFactory: FSqlConnectionFactory) {
		super();
		this._log = FLogger.create(this.constructor.name);
		this._sqlConnection = null;
		this._sqlConnectionFactory = sqlConnectionFactory;
		this._transactionIO = null;
	}

	public transactionCommit(executionContext: FExecutionContext): Promise<void> {
		if (!(this._transactionIO instanceof Promise)) {
			this._transactionIO = Promise.resolve();
		}

		this._transactionIO = this._transactionIO.then(async () => {
			//
			// We have not to cancel this operation, so pass noncancellableExecutionContext
			const noncancellableExecutionContext: FExecutionContext = new FCancellationExecutionContext(
				executionContext,
				FCancellationToken.Dummy
			);
			await this.sqlConnection.statement("COMMIT TRANSACTION").execute(noncancellableExecutionContext);
			await this.sqlConnection.statement("BEGIN TRANSACTION").execute(executionContext);
		});

		return this._transactionIO;
	}

	public async transactionRollback(executionContext: FExecutionContext): Promise<void> {
		if (!(this._transactionIO instanceof Promise)) {
			this._transactionIO = Promise.resolve();
		}

		this._transactionIO = this._transactionIO.then(async () => {
			//
			// We have not to cancel this operation, so pass noncancellableExecutionContext
			const noncancellableExecutionContext: FExecutionContext = new FCancellationExecutionContext(
				executionContext,
				FCancellationToken.Dummy
			);
			await this.sqlConnection.statement("ROLLBACK TRANSACTION").execute(noncancellableExecutionContext);
			await this.sqlConnection.statement("BEGIN TRANSACTION").execute(executionContext);
		});

		return this._transactionIO;
	}

	protected get log(): FLogger { return this._log; }

	protected get sqlConnection(): FSqlConnection {
		this.verifyInitializedAndNotDisposed();
		return this._sqlConnection!;
	}

	protected async onInit(): Promise<void> {
		const sqlConnection: FSqlConnection = await this._sqlConnectionFactory.create(this.initExecutionContext);
		try {
			await sqlConnection.statement("BEGIN TRANSACTION").execute(this.initExecutionContext);
		} catch (e) {
			try { await sqlConnection.dispose(); } catch (e2) {
				throw new FExceptionAggregate([
					FException.wrapIfNeeded(e),
					FException.wrapIfNeeded(e2)
				]);
			}
			throw e;
		}
		this._sqlConnection = sqlConnection;
	}

	protected async onDispose(): Promise<void> {
		try {
			await this.transactionRollback(this.initExecutionContext);
		} catch (e) {
			const ex: FException = FException.wrapIfNeeded(e);
			this.log.warn(this.initExecutionContext, () => `Failure to rollback SQL transaction. Error: ${ex.message}`);
			this.log.debug(this.initExecutionContext, "Failure to rollback SQL transaction.", ex);
		}

		await this._sqlConnection!.dispose();
		this._sqlConnection = null;
	}

	private readonly _sqlConnectionFactory: FSqlConnectionFactory;
	private readonly _log: FLogger;
	private _sqlConnection: FSqlConnection | null;
	private _transactionIO: null | Promise<void>;
}

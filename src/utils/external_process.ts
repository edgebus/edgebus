import { FException, FExceptionInvalidOperation, FExecutionContext, FLogger, FLoggerLabelsExecutionContext } from "@freemework/common";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import * as path from "path";

export class ExternalProcessException extends FException {
	public readonly stdErr: string | null;
	public constructor(message: string, stdErr?: string | null, ex?: FException) {
		super(message, ex);
		this.stdErr = stdErr !== undefined ? stdErr : null;
	}
}

export class ExternalProcessExceptionCannotSpawn extends ExternalProcessException {
	public constructor(message: string, ex?: FException) {
		super(message, null);
	}
}

export class ExternalProcessExceptionTimeout extends ExternalProcessException {
	public constructor(stdErr: string | null) {
		super("External process was killed by timeout", stdErr);
	}
}

export class ExternalProcessExceptionUnexpectedExitCode extends ExternalProcessException {
	public constructor({ executablePath, stdErr }: { readonly executablePath: string; readonly stdErr: string; }) {
		super(`External process ${executablePath} exit with unexpected code. ${stdErr}`, stdErr);
	}

}

export class ExternalProcessExceptionKilled extends ExternalProcessException {
	public constructor(stdErr: string | null) {
		super("External process was killed outside", stdErr);
	}
}

export class ExternalProcess {
	private readonly executablePath: string;
	private readonly timeoutMs: number;
	private readonly log: FLogger;

	public static create(executablePath: string, timeoutMs: number) {
		return new ExternalProcess(executablePath, timeoutMs);
	}

	private constructor(executablePath: string, timeoutMs: number) {
		this.executablePath = ExternalProcess.resolveScriptAbsolutePath(executablePath);
		this.timeoutMs = timeoutMs;
		this.log = FLogger.create(this.constructor.name);
	}

	/**
	 * Execute external application
	 * @param stdinData data that passed to external process (deserialized by utf-8)
	 * @returns grab stdOut data of external process
	 * @throws ExternalProcessException in cause of failure. The exception include `stdErr` field.
	 */
	public run(
		executionContext: FExecutionContext,
		stdinData: string
	): Promise<string> {
		return new Promise(async (resolve, reject) => {
			executionContext = new FLoggerLabelsExecutionContext(executionContext, { externalProcess: this.executablePath });

			this.log.debug(executionContext, () => `Run external process with stdin data: '${stdinData}'`);

			let timeout: NodeJS.Timeout | null = null;

			const cmd: ChildProcessWithoutNullStreams | ExternalProcessExceptionCannotSpawn = await runSpawn(this.executablePath, this.timeoutMs);
			if (cmd instanceof ExternalProcessExceptionCannotSpawn) {
				this.log.info(executionContext, () => `Failed spawn external process.`);
				reject(cmd);
				return;
			}

			const dataBuffer: Array<Buffer> = [];
			const errorBuffer: Array<Buffer> = [];

			cmd.stderr.on("data", (data: any) => {
				errorBuffer.push(Buffer.from(data));
			});

			cmd.stdout.on("data", (data: any) => {
				dataBuffer.push(Buffer.from(data));
			});

			cmd.once("close", (code: number | null) => {
				const errorStr = Buffer.concat(errorBuffer).toString();

				if (timeout !== null) {
					clearTimeout(timeout);
				}

				executionContext = new FLoggerLabelsExecutionContext(executionContext, { exitCode: code !== null ? code.toString() : "null" });

				if (this.log.isDebugEnabled) {
					const stdErrExecutionContext = new FLoggerLabelsExecutionContext(executionContext, { stream: "stdErr" });
					this.log.debug(stdErrExecutionContext, errorStr);
				}

				if (code === 0) {
					const dataStr = Buffer.concat(dataBuffer).toString();

					if (this.log.isDebugEnabled) {
						const stdoutExecutionContext = new FLoggerLabelsExecutionContext(executionContext, { stream: "stdout" });
						this.log.debug(stdoutExecutionContext, dataStr);
					}

					resolve(dataStr);
				} else {
					if (cmd.killed) {
						this.log.info(executionContext, () => `External process ${this.executablePath} killed.`);
						reject(new ExternalProcessExceptionKilled(errorStr));
					} else {

						const errMsg = `External process ${this.executablePath} exit with unexpected code.`;
						this.log.info(executionContext, errMsg);
						reject(new ExternalProcessExceptionUnexpectedExitCode({ executablePath: this.executablePath, stdErr: errorStr }));
					}
				}
			});

			timeout = setTimeout(
				() => {
					cmd.kill();
					const errMsg = `External process ${this.executablePath} timeout.`;

					this.log.info(executionContext, errMsg);
					reject(new ExternalProcessExceptionTimeout(errMsg));
				},
				this.timeoutMs
			);

			cmd.stdin.write(stdinData);
			cmd.stdin.end();
		});
	}

	private static resolveScriptAbsolutePath(scriptPath: string): string {
		const fullPath = path.isAbsolute(scriptPath)
			? scriptPath
			: path.join(process.cwd(), scriptPath);
		return fullPath;
	}
}


function runSpawn(path: string, timeoutMs: number): Promise<ChildProcessWithoutNullStreams | ExternalProcessExceptionCannotSpawn> {
	return new Promise((res) => {
		const cmd = spawn(path);
		const timeout = setTimeout(() => {
			if (cmd.exitCode !== null) {
				cmd.kill();
			}
			res(new ExternalProcessExceptionCannotSpawn(`Failed spawn external process ${path}, timeout`));
		}, timeoutMs);

		cmd.on('spawn', () => {
			clearTimeout(timeout);
			res(cmd);
		});
		cmd.on('error', (e) => {
			clearTimeout(timeout);
			res(new ExternalProcessExceptionCannotSpawn(`Failed spawn external process ${path}`, FException.wrapIfNeeded(e)));
		});
	});
}

import { FEnsure, FEnsureException, FException, FExecutionContext, FLogger, FLoggerLabelsExecutionContext } from "@freemework/common";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Message } from "../../model";
import { LabelsHandlerException } from "./labels_handler_exception";

const ensure: FEnsure = FEnsure.create();

export class ExternalLabelsHandlerException extends LabelsHandlerException { }

export class ExternalProcessException extends ExternalLabelsHandlerException {
	public constructor(message: string, public readonly stderr: string | null, ex?: FException) {
		super(message, ex);
	}
}

export class ExternalProcessExceptionCannotSpawn extends ExternalProcessException {
	public constructor(message: string, ex?: FException) {
		super(message, null);
	}
}

export class ExternalProcessExceptionTimeout extends ExternalProcessException {
	public constructor(stderr: string | null) {
		super("External process was killed by timeout", stderr);
	}
}

export class ExternalProcessExceptionUnexpectedExitCode extends ExternalProcessException {
	public constructor({ executablePath, stderr }: { readonly executablePath: string; readonly stderr: string; }) {
		super(`External process ${executablePath} exit with unexpected code. ${stderr}`, stderr);
	}

}

export class ExternalProcessExceptionParse extends ExternalProcessException {
	public constructor(message: string, ex: FException) {
		super(message, null, ex);
	}
}

export class ExternalProcessExceptionKilled extends ExternalProcessException {
	public constructor(stderr: string | null) {
		super("External process was killed outside", stderr);
	}
}


export class ExternalProcess {
	private readonly executablePath: string;
	private readonly timeoutMs: number;
	private timeout: NodeJS.Timeout | null = null;
	private readonly log: FLogger;

	constructor(executablePath: string, timeoutMs: number) {
		this.executablePath = executablePath;
		this.timeoutMs = timeoutMs;
		this.log = FLogger.create(ExternalProcess.name);
	}

	public execute(
		executionContext: FExecutionContext,
		message: Message.Id & Message.Data
	): Promise<Array<string>> {
		return new Promise(async (resolve, reject) => {
			executionContext = new FLoggerLabelsExecutionContext(executionContext, { externalProcess: this.executablePath });

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

				if (this.timeout) {
					clearTimeout(this.timeout);
				}

				executionContext = new FLoggerLabelsExecutionContext(executionContext, { exitCode: code !== null ? code.toString() : "null" });

				if (this.log.isDebugEnabled) {
					const stderrExecutionContext = new FLoggerLabelsExecutionContext(executionContext, { stream: "stderr" });
					this.log.debug(stderrExecutionContext, errorStr);
				}

				if (code === 0) {

					const dataStr = Buffer.concat(dataBuffer).toString();

					if (this.log.isDebugEnabled) {
						const stdoutExecutionContext = new FLoggerLabelsExecutionContext(executionContext, { stream: "stdout" });
						this.log.debug(stdoutExecutionContext, dataStr);
					}

					try {
						const dataRaw = JSON.parse(dataStr);
						const data: Array<any> = ensure.array(dataRaw);
						const result: Array<string> = data.map(label => ensure.string(label));
						resolve(result);
					} catch (e) {
						if (e instanceof FEnsureException) {
							const errMsg = 'Parse error. Expected json array of strings from external label handler.';

							this.log.info(executionContext, errMsg);
							reject(new ExternalProcessExceptionParse(errMsg, FException.wrapIfNeeded(e)));
						} else {
							const errMsg = 'Unexpected exception.';

							this.log.info(executionContext, errMsg);
							reject(new ExternalProcessException(errMsg, errorStr, FEnsureException.wrapIfNeeded(e)));
						}
					}
				} else {
					if (cmd.killed) {
						this.log.info(executionContext, () => `External process ${this.executablePath} killed.`);
						reject(new ExternalProcessExceptionKilled(errorStr));
					} else {

						const errMsg = `External process ${this.executablePath} exit with unexpected code.`;
						this.log.info(executionContext, errMsg);
						reject(new ExternalProcessExceptionUnexpectedExitCode({ executablePath: this.executablePath, stderr: errorStr }));
					}
				}
			});

			const msgBodyStr = message.messageBody.toString();

			this.timeout = setTimeout(() => {
				cmd.kill();
				const errMsg = `External process ${this.executablePath} timeout.`;

				this.log.info(executionContext, errMsg);
				reject(new ExternalProcessExceptionTimeout(errMsg));
			}, this.timeoutMs);

			cmd.stdin.write(msgBodyStr);
			cmd.stdin.end();
		});
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

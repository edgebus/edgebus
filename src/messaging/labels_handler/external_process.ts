import { FEnsure, FEnsureException, FException, FExecutionContext } from "@freemework/common";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Message } from "../../model";
import { ExternalProcessException, ExternalProcessExceptionCannotSpawn, ExternalProcessExceptionKilled, ExternalProcessExceptionParse, ExternalProcessExceptionTimeout, ExternalProcessExceptionUnexpectedExitCode } from "./external_process_exception";

const ensure: FEnsure = FEnsure.create();


export class ExternalProcess {
	private readonly path: string;
	private readonly timeoutMs: number;
	private timeout: NodeJS.Timeout | null = null;

	constructor(path: string, timeoutMs: number) {
		this.path = path;
		this.timeoutMs = timeoutMs;
	}

	public execute(
		executionContext: FExecutionContext,
		message: Message.Id & Message.Data
	): Promise<Array<string>> {
		return new Promise((resolve, reject) => {
			const cmd: ChildProcessWithoutNullStreams | ExternalProcessExceptionCannotSpawn = runSpawn(this.path);
			if (cmd instanceof ExternalProcessExceptionCannotSpawn) {
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
				if (code === 0) {
					const dataStr = Buffer.concat(dataBuffer).toString();
					try {
						const dataRaw = JSON.parse(dataStr);
						const data = ensure.array(dataRaw);
						const result: Array<string> = [];
						for (const item of data) {
							result.push(ensure.string(item));
						}

						if (this.timeout) {
							clearTimeout(this.timeout);
						}
						resolve(result);
					} catch (e) {
						if (this.timeout) {
							clearTimeout(this.timeout);
						}
						if (e instanceof FEnsureException) {
							reject(new ExternalProcessExceptionParse('Parse error. Expected json array of strings from external label handler. ', FException.wrapIfNeeded(e)))
						} else {
							reject(new ExternalProcessException('Unexpected exception.', FEnsureException.wrapIfNeeded(e)));
						}
					}
				} else {
					if (cmd.killed) {
						reject(new ExternalProcessExceptionKilled());
					} else {
						if (this.timeout) {
							clearTimeout(this.timeout);
						}
						reject(new ExternalProcessExceptionUnexpectedExitCode(`Exit with unexpected code ${code}`));
					}
				}
			});

			const msgBodyStr = message.messageBody.toString();

			this.timeout = setTimeout(() => {
				cmd.kill();
				reject(new ExternalProcessExceptionTimeout(`External process ${this.path} timeout`));
			}, this.timeoutMs);

			cmd.stdin.write(msgBodyStr);
			cmd.stdin.end();
		});
	}
}


function runSpawn(path: string): ChildProcessWithoutNullStreams | ExternalProcessExceptionCannotSpawn {
	try {
		return spawn(path);
	} catch (e) {
		return new ExternalProcessExceptionCannotSpawn(`Faild spawn ${path}`, FException.wrapIfNeeded(e));
	}
}

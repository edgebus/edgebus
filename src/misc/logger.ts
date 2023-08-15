import { FException, FExceptionInvalidOperation, FLogger, FLoggerBase, FLoggerLabels, FLoggerLevel } from "@freemework/common";

export abstract class LoggerConsole extends FLoggerBase {
	/**
	 * Factory constructor
	 */
	public static create(loggerName: string, opts?: {
		readonly level?: FLoggerLevel,
		readonly format?: LoggerConsole.Format;
	}): FLogger {
		const level: FLoggerLevel | null = opts !== undefined && opts.level !== undefined ? opts.level : null;
		const format: LoggerConsole.Format = opts !== undefined && opts.format !== undefined ? opts.format : "text";

		const levels: Map<FLoggerLevel, boolean> = new Map();
		levels.set(FLoggerLevel.FATAL, level != null && level >= FLoggerLevel.FATAL);
		levels.set(FLoggerLevel.ERROR, level != null && level >= FLoggerLevel.ERROR);
		levels.set(FLoggerLevel.WARN, level != null && level >= FLoggerLevel.WARN);
		levels.set(FLoggerLevel.INFO, level != null && level >= FLoggerLevel.INFO);
		levels.set(FLoggerLevel.DEBUG, level != null && level >= FLoggerLevel.DEBUG);
		levels.set(FLoggerLevel.TRACE, level != null && level >= FLoggerLevel.TRACE);

		if (format === "json") {
			return new LoggerConsoleJsonImpl(loggerName, levels);
		} else {
			return new LoggerConsoleTextImpl(loggerName, levels);
		}
	}

	protected constructor(loggerName: string, levels: Map<FLoggerLevel, boolean>) {
		super(loggerName);
		this._levels = levels;
	}

	protected isLevelEnabled(level: FLoggerLevel): boolean {
		const isEnabled: boolean | undefined = this._levels.get(level);
		return isEnabled === true;
	}

	private readonly _levels: Map<FLoggerLevel, boolean>;
}

export namespace LoggerConsole {
	export type Format = "text" | "json";
}


class LoggerConsoleTextImpl extends LoggerConsole {
	protected log(
		level: FLoggerLevel,
		labels: FLoggerLabels,
		message: string,
		exception?: FException
	): void {
		let name: string | null = this.name;
		if (name === null) {
			name = "Unnamed";
		}
		let logMessageBuffer = `${new Date().toISOString()} ${name} [${level}]`;
		for (const [labelName, labelValue] of Object.entries(labels)) {
			logMessageBuffer += `(${labelName}:${labelValue})`;
		}

		logMessageBuffer += (" ");
		logMessageBuffer += message;
		logMessageBuffer += "\n";

		if (exception != null) {
			logMessageBuffer += exception.toString();
			logMessageBuffer += "\n";
		}

		switch (level) {
			case FLoggerLevel.TRACE:
			case FLoggerLevel.DEBUG:
				console.debug(logMessageBuffer);
				break;
			case FLoggerLevel.INFO:
				console.log(logMessageBuffer);
				break;
			case FLoggerLevel.WARN:
			case FLoggerLevel.ERROR:
			case FLoggerLevel.FATAL:
				console.error(logMessageBuffer);
				break;
			default:
				throw new FExceptionInvalidOperation(`Unsupported log level '${level}'.`);
		}

	}

	public constructor(loggerName: string, levels: Map<FLoggerLevel, boolean>) {
		super(loggerName, levels);
	}
}

class LoggerConsoleJsonImpl extends LoggerConsole {
	protected log(
		level: FLoggerLevel,
		labels: FLoggerLabels,
		message: string,
		exception?: FException
	): void {
		const logEntry: Record<string, string> = {
			name: this.name,
			date: new Date().toISOString(),
			level: level.toString(),

		};

		for (const [labelName, labelValue] of Object.entries(labels)) {
			logEntry[labelName] = labelValue;
		}

		logEntry.message = message;

		if (exception != null) {
			logEntry["exception.name"] = exception.name;
			logEntry["exception.message"] = exception.message;
			if (exception.stack !== undefined) {
				logEntry["exception.stack"] = exception.stack;
			}
		}

		const logMessage: string = JSON.stringify(logEntry);
		switch (level) {
			case FLoggerLevel.TRACE:
			case FLoggerLevel.DEBUG:
				console.debug(logMessage);
				break;
			case FLoggerLevel.INFO:
				console.log(logMessage);
				break;
			case FLoggerLevel.WARN:
			case FLoggerLevel.ERROR:
			case FLoggerLevel.FATAL:
				console.error(logMessage);
				break;
			default:
				throw new FExceptionInvalidOperation(`Unsupported log level '${level}'.`);
		}
	}

	public constructor(loggerName: string, levels: Map<FLoggerLevel, boolean>) {
		super(loggerName, levels);
	}
}

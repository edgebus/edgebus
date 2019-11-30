import { Initable } from "@zxteam/disposable";
import { CancellationToken } from "@zxteam/contract";

import { MessageBus } from "./MessageBus";
import { InvalidOperationError } from "@zxteam/errors";

export class MessageBusRabbitMQ extends Initable implements MessageBus {
	public constructor(opts: MessageBusRabbitMQ.Opts) {
		super();

		// TODO
	}

	public async publish(data: any): Promise<void> {
		throw new InvalidOperationError("Not implemented yet");
	}

	protected onInit(cancellationToken: CancellationToken): void | Promise<void> {
		// TODO
	}

	protected onDispose(): void | Promise<void> {
		// TODO
	}
}

export namespace MessageBusRabbitMQ {
	export interface Opts {
		// TODO
	}
}

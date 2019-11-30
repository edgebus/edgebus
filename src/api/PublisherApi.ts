import { CancellationToken, Logger, PublisherChannel } from "@zxteam/contract";
import { Initable } from "@zxteam/disposable";
import { InvalidOperationError } from "@zxteam/errors";

// Models
import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";
import { RecipientUser } from "../model/RecipientUser";

import { StorageProvider } from "../provider/StorageProvider";
import { MessageBusProvider } from "../provider/MessageBusProvider";

import { Message } from "../model/Message";

/**
 * Publisher API allows to send messages to the topics
 */
export class PublisherApi extends Initable {
	private readonly _storageProvider: StorageProvider;
	private readonly _messageBusProvider: MessageBusProvider;
	private readonly _log: Logger;

	public constructor(storageProvider: StorageProvider, messageBusProvider: MessageBusProvider, log: Logger) {
		super();
		this._storageProvider = storageProvider;
		this._messageBusProvider = messageBusProvider;
		this._log = log;
	}

	public async cancelMessage(messageId: Message["messageId"]): Promise<void> {
		throw new InvalidOperationError("Not implemented yet");
	}

	public async publishMessage(
		cancellationToken: CancellationToken, topicId: Topic["topicId"], messageData: Message.Data
	): Promise<Message["messageId"]> {
		// const message: Message = await this._storageProvider.persistentStorage
		// 	.registerMessage(cancellationToken, messageData);

		// await this._messageBusProvider.messageBus.publish(cancellationToken, {
		// 	messageId: message.messageId,
		// 	mediaType: message.mediaType,
		// 	body: message.body,
		// 	signature: message.signature
		// });

		// return message.messageId;

		throw new InvalidOperationError("Not implemented yet");
	}

	public async getMessage(messageId: Message["messageId"]): Promise<Message> {
		// TODO: read message data and status
		throw new InvalidOperationError("Not implemented yet");
	}

	protected async onInit() {
		// nop
	}
	protected async onDispose() {
		// nop
	}
}

export namespace PublisherApi {

}

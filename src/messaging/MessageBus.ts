import { FDisposable, FExecutionContext, FChannelSubscriber } from "@freemework/common";

import { Topic } from "../model/Topic";
import { Message } from "../model/Message";
import { Subscriber } from "../model/Subscriber";

export interface MessageBus {
	publish(
		executionContext: FExecutionContext,
		topicName: Topic["topicName"],
		message: Message.Id & Message.Data
	): Promise<void>;

	retainChannel(
		executionContext: FExecutionContext,
		topicName: Topic["topicName"],
		subscriberId: Subscriber["subscriberId"]
	): Promise<MessageBus.Channel>;
}

export namespace MessageBus {
	export interface Channel extends FDisposable, FChannelSubscriber<Message.Id & Message.Data, Channel.Event> {
		readonly topicName: Topic["topicName"];
		wakeUp(): void;
	}
	export namespace Channel {
		export type Callback = FChannelSubscriber.Callback<Message.Id & Message.Data, Event>;
		export interface Event extends FChannelSubscriber.Event<Message.Id & Message.Data> {
			readonly source: Channel;
			delivered?: boolean;
		}
	}
}

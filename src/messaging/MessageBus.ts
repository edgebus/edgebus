import { CancellationToken, Disposable as DisposableLike, SubscriberChannel } from "@zxteam/contract";

import { Topic } from "../model/Topic";
import { Message } from "../model/Message";
import { Subscriber } from "../model/Subscriber";

export interface MessageBus {
	publish(
		cancellationToken: CancellationToken, topicName: Topic["topicName"], message: Message.Id & Message.Data
	): Promise<void>;

	retainChannel(
		cancellationToken: CancellationToken,
		topicName: Topic["topicName"],
		subscriberId: Subscriber["subscriberId"]
	): Promise<MessageBus.Channel>;

	markChannelForDestory(
		cancellationToken: CancellationToken,
		topicName: Topic["topicName"],
		subscriberId: Subscriber["subscriberId"]
	): Promise<void>;
}

export namespace MessageBus {
	export interface Channel extends DisposableLike, SubscriberChannel<Message.Id & Message.Data, Channel.Event> {
		readonly topicName: Topic["topicName"];
		wakeUp(): void;
	}
	export namespace Channel {
		export type Callback = SubscriberChannel.Callback<Message.Id & Message.Data, Event>;
		export interface Event extends SubscriberChannel.Event<Message.Id & Message.Data> {
			readonly source: Channel;
			delivered?: boolean;
		}
	}
}

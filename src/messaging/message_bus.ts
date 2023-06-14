import { FDisposable, FExecutionContext, FChannelEvent, FInitableBase } from "@freemework/common";

import { EgressApiIdentifier, IngressApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";
import { Topic } from "../model/topic";
import { Message } from "../model/message";

export abstract class MessageBus extends FInitableBase {
	public abstract publish(
		executionContext: FExecutionContext,
		ingressId: IngressApiIdentifier,
		message: Message.Id & Message.Data
	): Promise<void>;

	public abstract registerEgress(
		executionContext: FExecutionContext,
		egressId: EgressApiIdentifier
	): Promise<void>;

	public abstract registerTopic(
		executionContext: FExecutionContext,
		topicId: TopicApiIdentifier
	): Promise<void>;

	public abstract retainChannel(
		executionContext: FExecutionContext,
		topicId: TopicApiIdentifier,
		egressId: EgressApiIdentifier
	): Promise<MessageBus.Channel>;
}

export namespace MessageBus {
	export type DeliveryPolicy =
		| DeliveryPolicy.Parallel
		| DeliveryPolicy.Sequence;
	export namespace DeliveryPolicy {
		export const enum Type {
			PARALLEL = "parallel_delivery_policy",
			SEQUENCE = "sequence_delivery_policy",
		}

		export interface Base {
			readonly type: Type;
			/**
			 * There are many types of retry scale may be used.
			 * For example:
			 * - Fibonacci: 1ms 1ms 2ms 3ms 5ms 8ms 13ms etc
			 * - Power of two: 1ms 2ms 4ms 8ms 16ms 32ms 64ms 128ms 256ms etc
			 * ...
			 * 
			 * So we need some base class for this purposes...
			 */
			readonly retryOpts: "TBD";
		}

		export interface Parallel extends Base {
			readonly type: Type.PARALLEL;
		}

		export interface Sequence extends Base {
			readonly type: Type.SEQUENCE;
		}
	}

	export interface Channel extends FDisposable, FChannelEvent<Message.Id & Message.Data, Channel.Event> {
		readonly topicName: Topic["topicName"];
		// wakeUp(): void;
	}
	export namespace Channel {
		export type Callback = FChannelEvent.Callback<Message.Id & Message.Data, Event>;
		export interface Event extends FChannelEvent.Event<Message.Id & Message.Data> {
			readonly source: Channel;
			deliveryEvidence?: any;
		}
	}

	export interface ChannelFactory {
		(): Promise<Channel>;
	}
}

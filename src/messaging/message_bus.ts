import { FDisposable, FExecutionContext, FChannelEvent, FInitableBase } from "@freemework/common";

import { EgressIdentifier, IngressIdentifier, Message, Topic, TopicIdentifier } from "../model";
import { DeliveryEvidence } from "../model/delivery_evidence";


export abstract class MessageBus extends FInitableBase {
	public abstract publish(
		executionContext: FExecutionContext,
		ingressId: IngressIdentifier,
		message: Message.Id & Message.Data
	): Promise<void>;

	public abstract registerEgress(
		executionContext: FExecutionContext,
		egressId: EgressIdentifier
	): Promise<void>;

	public abstract registerTopic(
		executionContext: FExecutionContext,
		topicId: TopicIdentifier
	): Promise<void>;

	public abstract retainChannel(
		executionContext: FExecutionContext,
		topicId: TopicIdentifier,
		egressId: EgressIdentifier
	): Promise<MessageBus.Channel>;

	public abstract getSuccessDeliveryEvidences(
		executionContext: FExecutionContext,
		message: Message.Id
	): Promise<DeliveryEvidence[]>;
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
		export type Callback = FChannelEvent.Callback<Message, Event>;
		export interface Event extends FChannelEvent.Event<Message> {
			readonly source: Channel;
			deliveryEvidence?: any;
		}
	}

	export interface ChannelFactory {
		(): Promise<Channel>;
	}
}

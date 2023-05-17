import { FExecutionContext, FInitable, FInitableBase } from "@freemework/common";

import { Egress } from "../model/egress";
import { Ingress } from "../model/ingress";
import { Topic } from "../model/topic";
import { Security } from "../model/security";
import { Message } from "../model/message";
import { IngressApiIdentifier, MessageApiIdentifier } from "../misc/api-identifier";

export abstract class Database extends FInitableBase {

	public abstract createEgress(
		executionContext: FExecutionContext,
		egressData: Partial<Egress.Id> & Egress.Data
	): Promise<Egress>;

	public abstract createIngress(
		executionContext: FExecutionContext,
		ingressData: Partial<Ingress.Id> & Ingress.Data
	): Promise<Ingress>;

	/**
	 * Register a message entity and related egress message queue entities
	 * @param executionContext TBD
	 * @param ingressApiId TBD
	 * @param messageApiId TBD
	 * @param headers TBD
	 * @param mimeType TBD
	 * @param transformedBody TBD
	 * @param originalBody TBD
	 */
	public abstract createMessage(
		executionContext: FExecutionContext,
		ingressApiId: IngressApiIdentifier,
		messageApiId: MessageApiIdentifier,
		headers: Message.Headers,
		mimeType?: string,
		originalBody?: Uint8Array,
		transformedBody?: Uint8Array,
	): Promise<void>;


	public abstract createTopic(
		executionContext: FExecutionContext,
		topicData: Partial<Topic.Id> & Topic.Data
	): Promise<Topic>;

	public abstract findEgress(executionContext: FExecutionContext, opts: Egress.Id): Promise<Egress | null>;

	public abstract findIngress(executionContext: FExecutionContext, opts: Ingress.Id): Promise<Ingress | null>;

	public abstract findTopic(executionContext: FExecutionContext, opts: Topic.Id | Topic.Name | Ingress.Id): Promise<Topic | null>;

	public abstract getEgress(executionContext: FExecutionContext, opts: Egress.Id): Promise<Egress>;

	public abstract getIngress(executionContext: FExecutionContext, opts: Ingress.Id): Promise<Ingress>;

	public abstract getTopic(executionContext: FExecutionContext, opts: Topic.Id | Topic.Name | Ingress.Id): Promise<Topic>;

	public abstract listTopics(
		executionContext: FExecutionContext,
		domain: string | null
	): Promise<Array<Topic>>;


	// getSubscriber(
	// executionContext: FExecutionContext,
	// 	egressId: EgressApiIdentifier
	// ): Promise<Egress>;

	// getTopic(
	// executionContext: FExecutionContext,
	// 	topic: Topic.Id
	// ): Promise<Topic>;

	// getTopicBySubscriber(
	// executionContext: FExecutionContext,
	// 	egressId: EgressApiIdentifier
	// ): Promise<Topic>;

	// removePublish(
	// executionContext: FExecutionContext,
	// 	ingressId: Ingress["ingressId"]
	// ): Promise<void>;

	// removeSubscriber(
	// executionContext: FExecutionContext,
	// 	egressId: EgressApiIdentifier
	// ): Promise<void>;

	// removeTopic(
	// executionContext: FExecutionContext,
	// 	topic: Topic.Id
	// ): Promise<void>;

	public abstract transactionCommit(executionContext: FExecutionContext): Promise<void>;
	public abstract transactionRollback(executionContext: FExecutionContext): Promise<void>;
}

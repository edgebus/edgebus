import { FException, FExecutionContext, FInitableBase, FLogger } from "@freemework/common";

// Models
import { Topic } from "../model/topic";

import { DatabaseFactory } from "../data/database_factory";
import { EgressApiIdentifier, IngressApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";
import { Database } from "../data/database";
import { Ingress } from "../model/ingress";
import { Egress } from "../model/egress";
import { MessageBus } from "../messaging/message_bus";

/**
 * Management API allows to control user's delivery endpoints, like add/remove webhooks
 */
export class ManagementApi extends FInitableBase {
	public constructor(
		private readonly _dbFactory: DatabaseFactory,
		private readonly _messageBus: MessageBus,
	) {
		super();
		this._log = FLogger.create(ManagementApi.name);
		this.__db = null;
	}

	public async createEgress(
		executionContext: FExecutionContext, ingressData: Partial<Egress.Id> & Egress.Data
	): Promise<Egress> {
		this.verifyInitializedAndNotDisposed();

		const fullEgressData: Egress.Id & Egress.Data = {
			...ingressData,
			egressId: ingressData.egressId ?? new EgressApiIdentifier(),
		};

		const egress: Egress = await this._db.createEgress(
			executionContext,
			fullEgressData
		);
		await this._db.transactionCommit(executionContext);

		await this._messageBus.registerEgress(executionContext, egress.egressId);

		this._log.trace(executionContext, () => `Exit createEgress with data: ${JSON.stringify(egress)}`);
		return egress;
	}

	public async createIngress(
		executionContext: FExecutionContext, ingressData: Partial<Ingress.Id> & Ingress.Data
	): Promise<Ingress> {
		this.verifyInitializedAndNotDisposed();

		const fullIngressData: Ingress.Id & Ingress.Data = {
			...ingressData,
			ingressId: ingressData.ingressId ?? new IngressApiIdentifier(),
		};

		const ingress: Ingress = await this._db.createIngress(
			executionContext,
			fullIngressData
		);

		this._log.trace(executionContext, () => `Exit createIngress with data: ${JSON.stringify(ingress)}`);
		return ingress;
	}

	public async createTopic(
		executionContext: FExecutionContext, topicData: Partial<Topic.Id> & Topic.Data
	): Promise<Topic> {
		this.verifyInitializedAndNotDisposed();

		const fullTopicData: Topic.Id & Topic.Data = {
			topicId: topicData.topicId ?? new TopicApiIdentifier(),
			topicName: topicData.topicName,
			topicDomain: topicData.topicDomain,
			topicDescription: topicData.topicDescription,
			topicMediaType: topicData.topicMediaType
		};

		const topic: Topic = await this._db.createTopic(
			executionContext,
			fullTopicData
		);
		await this._db.transactionCommit(executionContext);

		await this._messageBus.registerTopic(executionContext, topic.topicId);

		this._log.debug(executionContext, () => `Exit createTopic with data: ${JSON.stringify(topic)}`);
		return topic;
	}

	public async findEgress(executionContext: FExecutionContext, egressId: EgressApiIdentifier): Promise<Egress | null> {
		this.verifyInitializedAndNotDisposed();

		const egress = await this._db.findEgress(executionContext, { egressId });

		return egress;
	}

	public async findIngress(executionContext: FExecutionContext, ingressId: IngressApiIdentifier): Promise<Ingress | null> {
		this.verifyInitializedAndNotDisposed();

		const ingress = await this._db.findIngress(executionContext, { ingressId });

		return ingress;
	}

	public async findTopic(executionContext: FExecutionContext, topicId: TopicApiIdentifier): Promise<Topic | null> {
		this.verifyInitializedAndNotDisposed();

		const topic = await this._db.findTopic(executionContext, { topicId });

		return topic;
	}

	public async listTopics(
		executionContext: FExecutionContext, domain: string | null
	): Promise<Array<Topic>> {
		this.verifyInitializedAndNotDisposed();

		const topics: Array<Topic> = await this._db.listTopics(executionContext);
		return topics;
	}

	// public async destroyTopic(
	// 	executionContext: FExecutionContext, topicId: Topic.Id, security: Security
	// ): Promise<void> {
	// 	this._log.debug(`Run destroyTopic with topic: ${topicId}`);

	// 	try {
	// 		const topicRecord: Topic = await this._storage.getTopic(cancellationToken, topicId);

	// 		const topicSecurityKind = topicRecord.topicSecurity.kind;
	// 		const topicSecurityToken = topicRecord.topicSecurity.token;

	// 		if (security.kind !== topicSecurityKind || security.token !== topicSecurityToken) {
	// 			throw new WrongArgumentApiError(`Wrong topic Security Kind or topic Security Token`);
	// 		}

	// 		if (topicRecord.deleteAt) {
	// 			throw new WrongArgumentApiError(`Topic ${topicId.topicName} already deleted`);
	// 		}

	// 		await this._storage.removeTopic(cancellationToken, topicId);
	// 	} catch (e) {
	// 		this._log.error(`destroyTopic Error: ${e.message}`);
	// 		throw apiHandledException(e);
	// 	}
	// }

	public async persist(executionContext: FExecutionContext): Promise<void> {
		this.verifyInitializedAndNotDisposed();

		await this.__db!.transactionCommit(executionContext);
	}

	protected async onInit() {
		this.__db = await this._dbFactory.create(this.initExecutionContext);
	}
	protected async onDispose() {
		this.__db!.transactionRollback(this.initExecutionContext);
		this.__db!.dispose();
	}

	private get _db(): Database {
		this.verifyInitializedAndNotDisposed();
		return this.__db!;
	}

	private __db: Database | null;
	private readonly _log: FLogger;
}

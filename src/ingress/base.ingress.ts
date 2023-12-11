import { FInitableBase, FLogger } from "@freemework/common";

import { IngressIdentifier, TopicIdentifier, Topic } from "../model";

export abstract class BaseIngress extends FInitableBase {
	public readonly ingressId: IngressIdentifier;
	protected readonly _log: FLogger;
	private readonly _topicName: Topic["topicName"];
	private readonly _topicId: TopicIdentifier;

	public constructor(topic: Topic.Id & Topic.Name, ingressId: IngressIdentifier) {
		super();
		this.ingressId = ingressId;
		this._log = FLogger.create(this.constructor.name);
		this._topicName = topic.topicName;
		this._topicId = topic.topicId;
	}

	protected get topicName(): Topic["topicName"] { return this._topicName; }
	protected get topicId(): TopicIdentifier { return this._topicId; }
}

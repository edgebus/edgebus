import { FInitableBase, FLogger } from "@freemework/common";

import { IngressIdentifier, TopicIdentifier, Topic } from "../model";

export abstract class BaseIngress extends FInitableBase {
	public readonly ingressId: IngressIdentifier;
	protected readonly _log: FLogger;
	private readonly _topicName: Topic["topicName"];
	private readonly _topicId: TopicIdentifier;
	private readonly _topicKind: Topic.Kind;

	public constructor(topic: Topic.Id & Topic.Name & Topic.Data, ingressId: IngressIdentifier) {
		super();
		this.ingressId = ingressId;
		this._log = FLogger.create(this.constructor.name);
		this._topicName = topic.topicName;
		this._topicId = topic.topicId;
		this._topicKind = topic.topicKind;
	}

	protected get topicName(): Topic["topicName"] { return this._topicName; }
	protected get topicId(): TopicIdentifier { return this._topicId; }
	protected get topicKind(): Topic.Kind { return this._topicKind; }
}

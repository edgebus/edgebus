import { FInitableBase, FLogger } from "@freemework/common";

import { Ingress } from "../model/ingress";
import { Topic } from "../model/topic";
import { IngressApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";

export abstract class BaseIngress extends FInitableBase {
	public readonly ingressId: IngressApiIdentifier;
	protected readonly _log: FLogger;
	private readonly _topicName: Topic["topicName"];
	private readonly _topicId: TopicApiIdentifier;

	public constructor(topic: Topic.Id & Topic.Name, ingressId: IngressApiIdentifier) {
		super();
		this.ingressId = ingressId;
		this._log = FLogger.create(this.constructor.name);
		this._topicName = topic.topicName;
		this._topicId = topic.topicId;
	}

	protected get topicName(): Topic["topicName"] { return this._topicName; }
	protected get topicId(): TopicApiIdentifier { return this._topicId; }
}

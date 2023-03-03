import { FInitableBase } from "@freemework/common";

import { Publisher } from "../model/publisher";
import { Topic } from "../model/topic";

export abstract class BasePublisher extends FInitableBase {
	public readonly publisherId: Publisher["publisherId"];
	private readonly _topicName: Topic["topicName"];

	public constructor(topic: Topic.Id, publisherId: Publisher["publisherId"]) {
		super();
		this.publisherId = publisherId;
		this._topicName = topic.topicName;
	}

	protected get topicName(): Topic["topicName"] { return this._topicName; }
}

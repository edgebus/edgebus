import { Topic } from "../model/Topic";
import { Publisher } from "../model/Publisher";
import { FInitableBase } from "@freemework/common";

export abstract class PublisherBase extends FInitableBase {
	public readonly publisherId: Publisher["publisherId"];
	private readonly _topicName: Topic["topicName"];

	public constructor(topic: Topic.Id, publisherId: Publisher["publisherId"]) {
		super();
		this.publisherId = publisherId;
		this._topicName = topic.topicName;
	}

	protected get topicName(): Topic["topicName"] { return this._topicName; }
}

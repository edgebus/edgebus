import { Topic } from "../model/Topic";
import { Publisher } from "../model/Publisher";

export abstract class PublisherBase {
	public readonly publisherId: Publisher["publisherId"];
	private readonly _topicName: Topic["topicName"];

	public constructor(topic: Topic.Id, publisherId: Publisher["publisherId"]) {
		this.publisherId = publisherId;
		this._topicName = topic.topicName;
	}

	protected get topicName(): Topic["topicName"] { return this._topicName; }
}

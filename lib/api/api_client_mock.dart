import 'package:freemework/execution_context/f_execution_context.dart';
import 'package:uuid/uuid.dart' show Uuid;

import '../model/topic.dart' show Topic;
import '../model/topic_id.dart' show TopicId;

import 'api_client.dart';

class ApiClientMock extends ApiClient {
  final Map<TopicId, Topic> _topics;

  ApiClientMock() : _topics = {} {
    const TopicId id1 = "0730c8b1-ebdd-4761-b90e-82f59f140c32";
    const TopicId id2 = "950f6177-37c3-4bef-b236-2bc1e7635ac1";

    final Topic topic1 = Topic(id1, "my-topic-1", "Some messages 1");
    final Topic topic2 = Topic(id2, "my-topic-2", "Some messages 2");

    this._topics[id1] = topic1;
    this._topics[id2] = topic2;
  }

// This method create topic.
  @override
  Future<Topic> createTopic(
    FExecutionContext executionContext, {
    required String name,
    required String description,
  }) async {
    final TopicId id = const Uuid().toString();
    final Topic topic = Topic(id, name, description);

    this._topics[id] = topic;

    return topic;
  }

// This method delete topic from topic list.
  @override
  Future<void> deleteTopic(
    FExecutionContext executionContext,
    TopicId topicId,
  ) async {
    if (this._topics.containsKey(topicId)) {
      this._topics.remove(topicId);
    } else {
      throw Exception("Specified topic not found.");
    }
  }

// This method return list topic.
  @override
  Future<List<Topic>> listTopics(
    FExecutionContext executionContext,
  ) async {
    return this._topics.values.toList(growable: false);
  }

// This method change topic description and return previous topic.
  @override
  Future<String> updateTopicDescription(
    FExecutionContext executionContext,
    TopicId topicId,
    String newDescription,
  ) async {
    if (this._topics.containsKey(topicId)) {
      final Topic oldTopic = this._topics[topicId]!;
      final Topic newTopic = Topic(oldTopic.id, oldTopic.name, newDescription);
      this._topics[topicId] = newTopic;

      return oldTopic.description;
    }
    throw Exception("Specified topic not found.");
  }
}

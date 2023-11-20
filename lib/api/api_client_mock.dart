// ignore_for_file: unnecessary_this

import 'package:freemework/execution_context/f_execution_context.dart'
    show FExecutionContext;
import 'package:uuid/uuid.dart' show Uuid;

import '../model/topic.dart' show Topic;
import '../model/topic_id.dart' show TopicId;

import 'api_client.dart';

class ApiClientMock extends ApiClient {
  final Map<TopicId, Topic> _topics;

  ApiClientMock() : _topics = {} {
    const TopicId id1 = "1130c8b1-ebdd-4761-b90e-82f59f140cc1";
    const TopicId id2 = "220f6177-37c3-4bef-b236-2bc1e7635ac2";
    const TopicId id3 = "330de577-37c3-4bef-b236-2bc1e7635ac3";

    final Topic topic1 = Topic(id1, "my-topic-1", "Some messages 1");
    final Topic topic2 = Topic(
        id2, "my-topic-2", "Some messages 2 In hac habitasse platea dictumst.");
    final Topic topic3 = Topic(id3, "my-topic-3",
        "In hac habitasse platea dictumst. Ut placerat odio in malesuada rhoncus. Nam commodo, quam ac vestibulum iaculis, ipsum nulla sagittis tortor, id aliquet tellus elit in ante.");

    this._topics[id1] = topic1;
    this._topics[id2] = topic2;
    this._topics[id3] = topic3;
  }

// This method create topic.
  @override
  Future<Topic> createTopic(
    FExecutionContext executionContext, {
    required String name,
    required String description,
  }) async {
    await Future.delayed(const Duration(seconds: 3));

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
    await Future.delayed(const Duration(seconds: 3));

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
    await Future.delayed(const Duration(seconds: 3));

    return this._topics.values.toList(growable: false);
  }

// This method change topic description and return previous topic.
  @override
  Future<String> updateTopicDescription(
    FExecutionContext executionContext,
    TopicId topicId,
    String newDescription,
  ) async {
    await Future.delayed(const Duration(seconds: 3));

    if (this._topics.containsKey(topicId)) {
      final Topic oldTopic = this._topics[topicId]!;
      final Topic newTopic = Topic(oldTopic.id, oldTopic.name, newDescription);
      this._topics[topicId] = newTopic;

      return oldTopic.description;
    }
    throw Exception("Specified topic not found.");
  }
}

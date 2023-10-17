import 'topic_id.dart' show TopicId;

class Topic {
  final TopicId id;
  final String name;
  final String description;

  Topic(
    this.id,
    this.name,
    this.description,
  );
}

import 'package:edgebus_console/model/ingress_path.dart' show IngressPath;
import 'package:edgebus_console/model/ingress_url.dart' show IngressUrl;
import 'package:freemework/freemework.dart' show FExecutionContext;

import '../model/topic.dart' show Topic;
import '../model/topic_id.dart';

abstract class ApiClient {
  //
  Future<Topic> createTopic(
    FExecutionContext executionContext, {
    required String name,
    required String description,
  });

  Future<void> deleteTopic(
    FExecutionContext executionContext,
    TopicId topicId,
  );

  Future<List<Topic>> listTopics(
    FExecutionContext executionContext,
  );

  Future<String> updateTopicDescription(
    FExecutionContext executionContext,
    TopicId topicId,
    String newDescription,
  );

  Future<(List<IngressPath>, List<IngressUrl>)> listIngress(
    FExecutionContext executionContext,
  );
}

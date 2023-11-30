import 'package:edgebus_console/model/ingress.dart' show Ingress;
import 'package:edgebus_console/model/ingress_id.dart' show IngressId;
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

  Future<List<Ingress>> listIngress(
    FExecutionContext executionContext,
  );

  Future<void> deleteIngress(
    FExecutionContext executionContext,
    IngressId ingressId,
  );
}

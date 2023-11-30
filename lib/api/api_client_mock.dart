// ignore_for_file: unnecessary_this

import 'package:edgebus_console/model/ingress.dart';
import 'package:edgebus_console/model/ingress_http_host.dart'
    show IngressHttpHost;
import 'package:edgebus_console/model/ingress_web_socket_client.dart'
    show IngressWebSocketClient;
import 'package:freemework/execution_context/f_execution_context.dart'
    show FExecutionContext;
import 'package:uuid/uuid.dart' show Uuid;
import '../model/topic.dart' show Topic;
import '../model/topic_id.dart' show TopicId;
import '../model/ingress_id.dart' show IngressId;

// import '../model/ingress_path.dart' show IngressPath;
// import '../model/ingress_url.dart' show IngressUrl;

import 'api_client.dart' show ApiClient;

class ApiClientMock extends ApiClient {
  final Map<TopicId, Topic> _topics;
  // final Map<IngressId, IngressPath> _ingressesPath;
  // final Map<IngressId, IngressUrl> _ingressesUrl;

  final Map<IngressId, Ingress> _ingresses;

  ApiClientMock()
      : _topics = {},
        _ingresses = {} {
    const TopicId id1 = "1130c8b1-ebdd-4761-b90e-82f59f140cc1";
    const TopicId id2 = "220f6177-37c3-4bef-b236-2bc1e7635ac2";
    const TopicId id3 = "330de577-37c3-4bef-b236-2bc1e7635ac3";

    final Topic topic1 = Topic(
      id1,
      "my-topic-1",
      "Some messages 1",
    );
    final Topic topic2 = Topic(
      id2,
      "my-topic-2",
      "Some messages 2 In hac habitasse platea dictumst.",
    );
    final Topic topic3 = Topic(
      id3,
      "my-topic-3",
      "In hac habitasse platea dictumst. Ut placerat odio in malesuada rhoncus. Nam commodo, quam ac vestibulum iaculis, ipsum nulla sagittis tortor, id aliquet tellus elit in ante.",
    );

    this._topics[id1] = topic1;
    this._topics[id2] = topic2;
    this._topics[id3] = topic3;

    const IngressId index1 = "1-IGRSafb0ff9b217d4a5c8b33d76291bb7d81";
    const IngressId index2 = "2-IGRSafb0ff9b217d4a5c8b33d76291bb7d81";
    const IngressId index3 = "3-IGRSafb0ff9b217d4a5c8b33d76291bb7d81";

    final IngressHttpHost ingress1 = IngressHttpHost(
      index1,
      "HTTP_HOST",
      "/webhooks/fireblocks",
      "TOPC44e5b80b06f1447ebf38b6ab2c84c84a",
    );

    final IngressWebSocketClient ingress2 = IngressWebSocketClient(
      index2,
      "WEB_SOCKET_CLIENT",
      "TOPC44e5b80b06f1447ebf38b6ab2c84c84a",
      "wss://edgebus.in.cwtest.online/egress/websocket_host/EGRS7b009275b6ab40aea230b898fc56",
    );

    final IngressHttpHost ingress3 = IngressHttpHost(
      index3,
      "HTTP_HOST",
      "/webhooks/fireblocks",
      "TOPC44e5b80b06f1447ebf38b6ab2c84c84a",
    );

    this._ingresses[index1] = ingress1;
    this._ingresses[index2] = ingress2;
    this._ingresses[index3] = ingress3;
  }

// This method create topic.
  @override
  Future<Topic> createTopic(
    FExecutionContext executionContext, {
    required String name,
    required String description,
  }) async {
    await Future.delayed(const Duration(seconds: 3));

    final TopicId id = const Uuid().v4();
    final Topic topic = Topic(
      id,
      name,
      description,
    );

    this._topics[id] = topic;

    // Sure what name, description
    print("*****");
    print(
        "Call method ApiClientMock.createTopic with name: '${topic.name}' and description: '${topic.description}'. Topic was generated with id: '$id'.");
    print("*****");
    return topic;
  }

// This method delete topic from topic list.
  @override
  Future<void> deleteTopic(
    FExecutionContext executionContext,
    TopicId topicId,
  ) async {
    await Future.delayed(const Duration(seconds: 1));

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
    await Future.delayed(const Duration(seconds: 1));

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
      final Topic newTopic = Topic(
        oldTopic.id,
        oldTopic.name,
        newDescription,
      );
      this._topics[topicId] = newTopic;

// Sure what description change
      print("*****");
      print(
          "Call method ApiClientMock.createTopic with new description: '${newTopic.description}'.");
      print("*****");

      return oldTopic.description;
    }
    throw Exception("Specified topic not found.");
  }

  // This method return list ingress.

  @override
  Future<List<Ingress>> listIngress(
    FExecutionContext executionContext,
  ) async {
    await Future.delayed(const Duration(seconds: 1));

    return this._ingresses.values.toList(growable: false);
  }

  // This method delete ingress from ingress list.
  @override
  Future<void> deleteIngress(
    FExecutionContext executionContext,
    IngressId ingressId,
  ) async {
    await Future.delayed(const Duration(seconds: 1));

    if (this._ingresses.containsKey(ingressId)) {
      this._ingresses.remove(ingressId);
    } else {
      throw Exception("Specified ingress not found.");
    }
  }
}

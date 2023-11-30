// ignore_for_file: non_constant_identifier_names

import 'ingress.dart' show Ingress;

class IngressWebSocketClient extends Ingress {
  final String url;

  IngressWebSocketClient(
    this.url,
    String index,
    String kind,
    String target_topic_id,
  ) : super(index, kind, target_topic_id);
}

// ignore_for_file: non_constant_identifier_names

import 'ingress.dart' show Ingress;

class IngressHttpHost extends Ingress {
  final String path;

  IngressHttpHost(
    this.path,
    String index,
    String kind,
    String target_topic_id,
  ) : super(index, kind, target_topic_id);
}

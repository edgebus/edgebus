// ignore_for_file: non_constant_identifier_names

import 'ingress_id.dart' show IngressId;

class IngressUrl {
  final IngressId index;
  final String kind;
  final String target_topic_id;
  final String url;

  IngressUrl(
    this.index,
    this.kind,
    this.target_topic_id,
    this.url,
  );
}

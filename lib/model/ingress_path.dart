// ignore_for_file: non_constant_identifier_names

import 'ingress_id.dart' show IngressId;

class IngressPath {
  final IngressId index;
  final String kind;
  final String path;
  final String target_topic_id;


  IngressPath(
    this.index,
    this.kind,
    this.path,
    this.target_topic_id,
  );
}

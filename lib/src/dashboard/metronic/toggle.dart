import "dart:async" show Stream, StreamController;
import "package:ngdart/angular.dart"
    show Component, Input, Output, coreDirectives;
import 'package:ngforms/ngforms.dart';

@Component(
    selector: "metronicapp-toggle",
    templateUrl: "toggle.html",
    directives: <Object>[
      coreDirectives,
      formDirectives,
    ],
    styleUrls: <String>[])
class ToggleComponent {
  final _request = StreamController<bool>();

  @Input()
  bool value;

  @Input()
  bool small;

  @Input()
  bool disabled = false;

  @Output()
  Stream<bool> get valueChange => _request.stream;

  String get toggleClass {
    List<String> classes = <String>["kt-switch"];

    if (this.small == true) {
      classes.add("kt-switch--sm");
    }

    return classes.join(" ");
  }

  void handleClick() {
    if (this.disabled == false) {
      value = !value;
      this._request.add(value);
    }
  }
}

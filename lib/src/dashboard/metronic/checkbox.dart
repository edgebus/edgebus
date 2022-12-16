import "dart:async" show Stream, StreamController;
import "package:ngdart/angular.dart"
    show Component, Input, Output, coreDirectives;
import 'package:ngforms/ngforms.dart';

@Component(
    selector: "metronicapp-checkbox",
    templateUrl: "checkbox.html",
    directives: <Object>[
      coreDirectives,
      formDirectives,
    ],
    styleUrls: <String>[])
class CheckboxComponent {
  final StreamController<bool> _request = StreamController<bool>();

  @Input()
  String label = "";

  @Input()
  bool value;

  @Input()
  bool bold = false;

  @Input()
  bool disabled = false;

  @Input()
  bool solid = false;

  @Input()
  bool tick = false;

  @Input()
  String type;

  @Output()
  Stream<bool> get valueChange => _request.stream;

  String get checkboxClass {
    List<String> classes = <String>["kt-checkbox"];
    if (this.disabled == true) {
      classes.add("kt-checkbox--disabled");
    }
    if (this.bold == true) {
      classes.add("kt-checkbox--bold");
    }
    if (this.type != null) {
      classes.add("kt-checkbox--${this.type}");
    }
    if (this.solid == true) {
      classes.add("kt-checkbox--solid");
    }
    if (this.tick == true) {
      classes.add("kt-checkbox--tick");
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

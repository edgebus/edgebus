import "package:ngdart/angular.dart" show Component, Input, coreDirectives;
import "internal/toastr.dart" show toastr;

@Component(
    selector: "metronicapp-button",
    templateUrl: "button.html",
    directives: <Object>[
      coreDirectives,
    ],
    styleUrls: <String>[])
class ButtonComponent {
  @Input()
  String icon;

  @Input()
  bool clean;

  @Input()
  bool small;

  @Input()
  bool bold;

  @Input()
  bool outline;

  @Input()
  bool disabled;

  @Input()
  bool hover;

  @Input()
  Function action;

  @Input()
  String label;

  @Input()
  bool large;

  @Input()
  String type;

  @Input()
  String classes;

  @Input()
  dynamic param;

  bool _actionWait = false;

  String get buttonClass {
    String typePrefix = "btn-";
    if (this.outline == true) {
      typePrefix = "${typePrefix}outline-";
    }
    if (this.hover == true) {
      typePrefix = "${typePrefix}hover-";
    }
    List<String> buttonClass = <String>["btn"];
    if (this.type != null) {
      buttonClass.add("${typePrefix}${this.type}");
    }
    if (this.bold == true) {
      buttonClass.add("btn-bold");
    }
    if (this.clean == true) {
      buttonClass.add("btn-clean");
    }
    if (this.small == true) {
      buttonClass.add("btn-sm");
    }
    if (this.disabled == true) {
      buttonClass.add("disabled");
    }
    if (this.large == true) {
      buttonClass.add("btn-lg");
    }
    if (this._actionWait == true) {
      buttonClass.add("disabled");
    }
    if (this.icon != null && this.label == null) {
      buttonClass.add("btn-icon");
    }
    if (this.classes != null) {
      List<String> addClasses = this.classes.split(" ");
      buttonClass.addAll(addClasses);
    }
    return buttonClass.join(" ");
  }

  void handleClick() async {
    if (this.action != null &&
        this.disabled != true &&
        this._actionWait != true) {
      this._actionWait = true;
      try {
        if (this.param != null) {
          await this.action(this.param);
        } else {
          await this.action();
        }
      } catch (e) {
        toastr.error(e.toString());
      }
      this._actionWait = false;
    }
  }
}

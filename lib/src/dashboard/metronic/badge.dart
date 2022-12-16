import "package:ngdart/angular.dart" show Component, Input, coreDirectives;

@Component(
    selector: "metronicapp-badge",
    templateUrl: "badge.html",
    directives: <Object>[
      coreDirectives,
    ],
    styleUrls: <String>[])
class BadgeComponent {
  @Input()
  String title;

  @Input()
  String classes;

  @Input()
  String type;

  @Input()
  bool pill;

  @Input()
  bool outline;

  @Input()
  bool bold;

  String get badgeClass {
    List<String> badgeClass = <String>["kt-badge"];
    if (this.type != null) {
      badgeClass.add("kt-badge--${this.type}");
    }
    if (this.pill == true) {
      badgeClass.addAll(<String>["kt-badge--pill", "kt-badge--inline"]);
    }
    if (this.outline == true) {
      badgeClass.add("kt-badge--outline");
    }
    if (this.bold == true) {
      badgeClass.add("kt-font-bold");
    }
    if (this.classes != null) {
      List<String> addClasses = this.classes.split(" ");
      badgeClass.addAll(addClasses);
    }
    return badgeClass.join(" ");
  }
}

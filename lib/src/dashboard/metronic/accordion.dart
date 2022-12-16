import "package:ngdart/angular.dart"
    show
        Component,
        Input,
        NgTemplateOutlet,
        coreDirectives;

@Component(
    selector: "metronicapp-accordion",
    templateUrl: "accordion.html",
    directives: <Object>[
      NgTemplateOutlet,
      coreDirectives,
    ],
    styleUrls: <String>[])
class AccordionComponent {
  @Input()
  bool arrow;

  @Input()
  bool light;

  String get accordionBodyClass {
    List<String> accordionBodyClass = <String>["accordion"];
    if (this.light == true) {
      accordionBodyClass.add("accordion-light");
    }
    if (this.arrow == true) {
      accordionBodyClass.add("accordion-toggle-arrow");
    }
    return accordionBodyClass.join(" ");
  }
}

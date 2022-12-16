import "package:ngdart/angular.dart"
    show
        Component,
        ContentChild,
        Input,
        NgTemplateOutlet,
        TemplateRef,
        coreDirectives;

@Component(
    selector: "metronicapp-section",
    templateUrl: "section.html",
    directives: <Object>[
      NgTemplateOutlet,
      coreDirectives,
    ],
    styleUrls: <String>[])
class SectionComponent {
  @Input()
  bool solid = false;

  @Input()
  String title;

  String get sectionClass {
    List<String> sectionClass = <String>["kt-section__content"];

    if (this.solid == true) {
      sectionClass.add("kt-section__content--solid");
    }

    return sectionClass.join(" ");
  }
}

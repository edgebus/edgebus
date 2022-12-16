import "dart:math" show Random;
import "package:ngdart/angular.dart"
    show
        Component,
        ContentChild,
        Directive,
        Input,
        NgTemplateOutlet,
        OnInit,
        TemplateRef,
        coreDirectives;

@Directive(selector: "[body]")
class AccordionItemBodyDirective {}

@Directive(selector: "[title]")
class AccordionItemTitleDirective {}

const List<Type> accordionItemDirectives = <Type>[
  AccordionItemBodyDirective,
  AccordionItemTitleDirective,
];

@Component(
    selector: "metronicapp-accordion-item",
    templateUrl: "accordion_item.html",
    directives: <Object>[
      NgTemplateOutlet,
      coreDirectives,
    ],
    styleUrls: <String>[])
class AccordionItemComponent implements OnInit {
  bool contentShow;
  @Input()
  String icon;

  @Input()
  String title;

  @Input()
  bool show;

  int id = Random().nextInt(10000000);

  @ContentChild(AccordionItemBodyDirective, read: TemplateRef)
  TemplateRef body;

  @ContentChild(AccordionItemTitleDirective, read: TemplateRef)
  TemplateRef titleTemplate;

  String get accordionItemBodyClass {
    List<String> accordionItemBodyClass = <String>["collapse"];
    if (this.show == true) {
      accordionItemBodyClass.add("show");
    }
    return accordionItemBodyClass.join(" ");
  }

  String get accordionItemTitleClass {
    List<String> accordionItemTitleClass = <String>["card-title"];
    if (this.show != true) {
      accordionItemTitleClass.add("collapsed");
    }
    return accordionItemTitleClass.join(" ");
  }

  void showContent() {
    this.contentShow = !this.contentShow;
  }

  @override
  void ngOnInit() {
    this.contentShow = this.show ?? false;
  }
}

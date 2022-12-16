import "package:ngdart/angular.dart"
    show
        Component,
        ContentChild,
        Directive,
        Input,
        NgTemplateOutlet,
        TemplateRef,
        coreDirectives;

@Directive(selector: "[header]")
class BasicTableHeaderDirective {}

@Directive(selector: "[row]")
class BasicTableRowDirective {}

@Directive(selector: "[footer]")
class BasicTableFooterDirective {}

const List<Type> basicTableDirectives = <Type>[
  BasicTableHeaderDirective,
  BasicTableRowDirective,
  BasicTableFooterDirective,
];

@Component(
    selector: "metronicapp-basic-table",
    templateUrl: "basic_table.html",
    directives: <Object>[
      NgTemplateOutlet,
      coreDirectives,
    ],
    styleUrls: <String>[])
class BasicTableComponent {
  @Input()
  bool dark = false;

  @Input()
  bool hover = false;

  @Input()
  dynamic itemsSource;

  @ContentChild(BasicTableHeaderDirective, read: TemplateRef)
  TemplateRef header;

  @ContentChild(BasicTableRowDirective, read: TemplateRef)
  TemplateRef row;

  @ContentChild(BasicTableFooterDirective, read: TemplateRef)
  TemplateRef footer;

  String get tableClass {
    List<String> tableClasses = <String>["table"];
    if (this.dark == true) {
      tableClasses.add("table");
    }
    if (this.hover == true) {
      tableClasses.add("table-hover");
    }
    return tableClasses.join(" ");
  }
}

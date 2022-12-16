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
class DataTableHeaderDirective {}

@Directive(selector: "[row]")
class DataTableRowDirective {}

@Directive(selector: "[footer]")
class DataTableFooterDirective {}

const List<Type> dataTableDirectives = <Type>[
  DataTableHeaderDirective,
  DataTableRowDirective,
  DataTableFooterDirective,
];

@Component(
    selector: "metronicapp-data-table",
    templateUrl: "data_table.html",
    directives: <Object>[
      NgTemplateOutlet,
      coreDirectives,
    ],
    styleUrls: <String>[])
class DataTableComponent {
  @Input()
  bool dark = false;

  @Input()
  bool hover = false;

  @Input()
  dynamic itemsSource;

  @ContentChild(DataTableHeaderDirective, read: TemplateRef)
  TemplateRef header;

  @ContentChild(DataTableRowDirective, read: TemplateRef)
  TemplateRef row;

  @ContentChild(DataTableFooterDirective, read: TemplateRef)
  TemplateRef footer;

  

  // String get tableClass {
  //   List<String> tableClasses = <String>["table"];
  //   if (this.dark == true) {
  //     tableClasses.add("table");
  //   }
  //   if (this.hover == true) {
  //     tableClasses.add("table-hover");
  //   }
  //   return tableClasses.join(" ");
  // }
}

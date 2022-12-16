import "package:ngdart/angular.dart"
    show
        Component,
        ContentChild,
        Directive,
        Input,
        NgTemplateOutlet,
        TemplateRef,
        coreDirectives;

@Directive(selector: "[toolbar]")
class PortletToolbarDirective {}

@Directive(selector: "[body]")
class PortletBodyDirective {}

@Directive(selector: "[footer]")
class PortletFooterDirective {}

const List<Type> portletDirectives = <Type>[
  PortletBodyDirective,
  PortletFooterDirective,
  PortletToolbarDirective,
];

@Component(
    selector: "metronicapp-portlet",
    templateUrl: "portlet.html",
    directives: <Object>[
      NgTemplateOutlet,
      coreDirectives,
    ],
    styleUrls: <String>[])
class PortletComponent {
  @Input()
  String icon;

  @Input()
  bool bordered = false;

  @Input()
  bool fit = false;

  @Input()
  bool solid = false;

  @Input()
  String title;

  @Input()
  String type;

  @Input()
  String headerType;

  @Input()
  bool subTitle;

  @ContentChild(PortletBodyDirective, read: TemplateRef)
  TemplateRef body;

  @ContentChild(PortletFooterDirective, read: TemplateRef)
  TemplateRef footer;

  @ContentChild(PortletToolbarDirective, read: TemplateRef)
  TemplateRef toolbar;

  bool get showTitle => this.title != null || this.subTitle != null;

  bool get showHeader =>
      this.showTitle || this.icon != null || this.toolbar != null;

  String get portletClass {
    List<String> portletClass = <String>["kt-portlet"];
    if (this.bordered == true) {
      portletClass.add("kt-portlet--bordered");
    }
    if (this.type != null) {
      portletClass.add("kt-bg-${this.type}");
    }
    return portletClass.join(" ");
  }

  String get portletHeaderClass {
    List<String> portletHeaderClass = <String>["kt-portlet__head"];
    if (this.headerType != null) {
      portletHeaderClass.add("kt-bg-${this.headerType}");
    }
    return portletHeaderClass.join(" ");
  }

  String get portletBodyClass {
    List<String> portletBodyClass = <String>["kt-portlet__body"];
    if (this.fit == true) {
      portletBodyClass.add("kt-portlet__body--fit");
    }
    if (this.solid == true) {
      portletBodyClass.add("kt-portlet--skin-solid");
    }
    return portletBodyClass.join(" ");
  }
}

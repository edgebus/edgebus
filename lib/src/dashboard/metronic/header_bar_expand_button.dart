import "dart:html" show Element;

import "package:ngdart/angular.dart"
    show AfterContentInit, Component, coreDirectives;

import "../dashboard_contract.dart" show HeaderBarItemComponent;

@Component(
    selector: "metronicapp-header-bar-expand-button",
    templateUrl: "header_bar_expand_button.html",
    directives: <Object>[
      coreDirectives,
    ],
    styleUrls: <String>[])
class MetronicHeaderBarExpandButtonComponent extends HeaderBarItemComponent
    implements AfterContentInit {
  MetronicHeaderBarExpandButtonComponent(Element el) : super(el) {
    this.el.classes.add("kt-header__topbar-item");
    // this.el.classes.add("kt-header__topbar-item--search");
    this.el.classes.add("dropdown");
  }

  @override
  void ngAfterContentInit() {
    if (this.tooltip != null) {
      this.el.attributes["data-original-title"] = this.tooltip;
    }
  }
}

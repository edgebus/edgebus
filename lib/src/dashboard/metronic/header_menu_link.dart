import "dart:html" show Element;

import "package:ngdart/angular.dart" show Component, coreDirectives;

import "../dashboard_contract.dart" show HeaderMenuLinkComponent;

@Component(
    selector: "metronicapp-header-menu-link",
    templateUrl: "header_menu_link.html",
    directives: <Object>[
      coreDirectives,
    ],
    styleUrls: <String>[])
class MetronicHeaderMenuLinkComponent extends HeaderMenuLinkComponent {
  MetronicHeaderMenuLinkComponent(Element el) : super(el) {
    this.el.classes.add("kt-menu__item");
    this.el.attributes["aria-haspopup"] = "true";
  }
}

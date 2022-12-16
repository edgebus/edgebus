import "dart:html" show Element;

import "package:ngdart/angular.dart" show Component, coreDirectives;

import "../dashboard_contract.dart" show SideMenuSectionComponent;

@Component(
    selector: "metronicapp-side-menu-section",
    templateUrl: "side_menu_section.html",
    directives: <Object>[
      coreDirectives,
    ],
    styleUrls: <String>[])
class MetronicSideMenuSectionComponent extends SideMenuSectionComponent {
  MetronicSideMenuSectionComponent(Element el) : super(el) {
    this.el.classes.add("kt-menu__section");
  }
}

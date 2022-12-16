import "dart:html" show Element;

import "package:ngdart/angular.dart"
    show AfterViewInit, Component, OnDestroy, ViewChildren, coreDirectives;
import 'package:ngrouter/ngrouter.dart';

import "../dashboard_contract.dart" show SideMenuLinkComponent;

@Component(
    selector: "metronicapp-side-menu-link",
    templateUrl: "side_menu_link.html",
    directives: <Object>[
      coreDirectives,
      routerDirectives
    ],
    styleUrls: <String>[
      // "side_menu_link.scss.css",
    ])
class MetronicSideMenuLinkComponent extends SideMenuLinkComponent
    implements AfterViewInit, OnDestroy {
  final RouterLinkActive _routerLinkActive;

  // @ContentChildren(RouterLink)
  @ViewChildren(RouterLink)
  set links(List<RouterLink> value) {
    this._routerLinkActive.links = value;
  }

  String get linkClasses => this.icon != null
      ? <String>["kt-menu__link-icon", this.icon].join(" ")
      : "kt-menu__link-icon";

  MetronicSideMenuLinkComponent(Element el, Router router)
      : _routerLinkActive = RouterLinkActive(el, router),
        super(el, router) {
    this._routerLinkActive.routerLinkActive = "kt-menu__item--active";
    this.el.classes.add("kt-menu__item");
    this.el.attributes["aria-haspopup"] = "true";
  }

  @override
  void ngAfterViewInit() {
    this._routerLinkActive.ngAfterViewInit();
  }

  @override
  void ngOnDestroy() {
    this._routerLinkActive.ngOnDestroy();
  }
}

import "dart:html" show Element;

import 'package:ngdart/angular.dart';
import 'package:ngrouter/ngrouter.dart';


abstract class BaseComponent {
  final Element el;

  BaseComponent(this.el);
}

abstract class ApplicationComponent {
  TemplateRef get contentTemplate;
  TemplateRef get headerBarItemsTemplate;
  TemplateRef get headerMenuItemsTemplate;
  TemplateRef get sideMenuItemsTemplate;
  List<HeaderBarQuickpanelButtonComponent> get quickPanelButtons;
}

class HeaderBarItemModel {
  final String id;
  final String title;
  final String icon;
  final String tooltip;

  const HeaderBarItemModel(this.id, this.title, this.icon, this.tooltip);
}

abstract class HeaderBarItemComponent extends BaseComponent
    implements HeaderBarItemModel {
  @override
  @Input()
  String icon;

  @override
  @Input()
  String id;

  @override
  @Input()
  String title;

  @override
  @Input()
  String tooltip;

  HeaderBarItemComponent(Element el) : super(el);
}

abstract class HeaderBarQuickpanelButtonComponent
    extends HeaderBarItemComponent {
  TemplateRef get quickPanelContentTemplate;
  String get quickPanelId;
  String get quickPanelCloseButtonId;
  String get quickPanelToggleButtonId;

  HeaderBarQuickpanelButtonComponent(Element el) : super(el);
}

class HeaderMenuItemModel {
  final String icon;
  final String title;

  const HeaderMenuItemModel(this.icon, this.title) : super();
}

abstract class HeaderMenuItemComponent extends BaseComponent
    implements HeaderMenuItemModel {
  @override
  @Input()
  String icon;

  @override
  @Input()
  String title;

  HeaderMenuItemComponent(Element el) : super(el);
}

abstract class HeaderMenuLinkComponent extends HeaderMenuItemComponent {
  HeaderMenuLinkComponent(Element el) : super(el);
}

class SideMenuItemModel {
  const SideMenuItemModel();
}

abstract class SideMenuItemComponent extends BaseComponent
    implements SideMenuItemModel {
  SideMenuItemComponent(Element el) : super(el);
}

class SideMenuSectionModel extends SideMenuItemModel {
  final String title;

  const SideMenuSectionModel(this.title) : super();
}

abstract class SideMenuSectionComponent extends SideMenuItemComponent
    implements SideMenuSectionModel {
  @override
  @Input()
  String title;

  SideMenuSectionComponent(Element el) : super(el);
}

class SideMenuLinkModel extends SideMenuItemModel {
  final String title;
  final String route;
  final String icon;

  const SideMenuLinkModel(this.title, this.route, this.icon) : super();
}

abstract class SideMenuLinkComponent extends SideMenuItemComponent
    implements SideMenuLinkModel {
  final Router router;

  @override
  @Input()
  String title;

  @override
  @Input()
  String route;

  @override
  @Input()
  String icon;

  SideMenuLinkComponent(Element el, Router this.router) : super(el);
}

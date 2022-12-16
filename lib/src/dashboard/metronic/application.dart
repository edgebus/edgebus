import "dart:html" show Element;

import "package:ngdart/angular.dart"
    show
        AfterContentInit,
        AfterViewInit,
        Component,
        ContentChild,
        Directive,
        Input,
        OnInit,
        TemplateRef,
        coreDirectives;

import "../dashboard_contract.dart"
    show
        ApplicationComponent,
        HeaderBarQuickpanelButtonComponent,
        HeaderMenuItemComponent,
        SideMenuItemModel;

import "header_bar_quickpanel_button.dart";
import "internal/interop.dart"
    show KTApp_init, KTLayout_init, KTQuickPanel_init, KTUtil_init;
import "internal/quickpanel_component.dart" show QuickpanelComponent;

@Directive(selector: "[metronicapp-content]")
class ContentDirective {}

@Directive(selector: "[metronicapp-header-bar]")
class HeaderBarDirective {}

@Directive(selector: "[metronicapp-header-menu]")
class HeaderMenuDirective {}

@Directive(selector: "[metronicapp-side-menu]")
class SideMenuDirective {}

const List<Type> metronicApplicationDirectives = <Type>[
  ContentDirective,
  HeaderBarDirective,
  HeaderMenuDirective,
  SideMenuDirective,
];

@Component(
    selector: "metronicapp",
    templateUrl: "application.html",
    directives: <Object>[coreDirectives, QuickpanelComponent],
    styleUrls: <String>[])
class MetronicApplicationComponent extends ApplicationComponent
    implements AfterContentInit, AfterViewInit, OnInit {
  @Input()
  String applicationVersion;

  @Input()
  List<HeaderMenuItemComponent> headerMenuItems;

  @Input()
  List<SideMenuItemModel> sideMenuItems;

  @ContentChild(ContentDirective, read: TemplateRef)
  set contentTemplate(TemplateRef value) {
    this._contentTemplate = value;
  }

  @override
  TemplateRef get contentTemplate => this._contentTemplate;

  @ContentChild(HeaderBarDirective, read: TemplateRef)
  set headerBarItemsTemplate(TemplateRef value) {
    this._headerBarItemsTemplate = value;
  }

  @override
  TemplateRef get headerBarItemsTemplate => this._headerBarItemsTemplate;

  @ContentChild(HeaderMenuDirective, read: TemplateRef)
  set headerMenuItemsTemplate(TemplateRef value) {
    this._headerMenuItemsTemplate = value;
  }

  @override
  TemplateRef get headerMenuItemsTemplate => this._headerMenuItemsTemplate;

  @ContentChild(SideMenuDirective, read: TemplateRef)
  set sideMenuItemsTemplate(TemplateRef value) {
    this._sideMenuItemsTemplate = value;
  }

  @override
  TemplateRef get sideMenuItemsTemplate => this._sideMenuItemsTemplate;

  //@ContentChildren(MetronicHeaderBarQuickpanelButtonComponent, read: Element)
  // Angular cannot query MetronicHeaderBarQuickpanelButtonComponent due to templates
  // so we register quickpanel of buttons via `addQuickpanel`
  // List<Element> headerBarQuickpanelButtons;
  @override
  List<HeaderBarQuickpanelButtonComponent> get quickPanelButtons =>
      this._quickPanelButtons;

  static MetronicApplicationComponent _singleton;

  // // https://angulardart.xyz/guide/security
  // final DomSanitizationService sanitizer;

  factory MetronicApplicationComponent(Element el) {
    if (_singleton == null) {
      _singleton = MetronicApplicationComponent._(el);
    }
    return _singleton;
  }

  MetronicApplicationComponent._(Element el)
      : _el = el,
        _quickPanelButtons = <HeaderBarQuickpanelButtonComponent>[] {
    //
  }

  TemplateRef _contentTemplate;
  TemplateRef _headerBarItemsTemplate;
  TemplateRef _headerMenuItemsTemplate;
  TemplateRef _sideMenuItemsTemplate;
  final Element _el;
  final List<HeaderBarQuickpanelButtonComponent> _quickPanelButtons;

  @override
  void ngAfterViewInit() {
    // Called on DOMContentLoaded event via KTUtil.ready
    KTUtil_init();

    // // Called on DOMContentLoaded event via KTUtil.ready
    // KTChat_init();

    // // Called on DOMContentLoaded event via KTUtil.ready
    // KTOffcanvasPanel_init();

    // Called on $(document).ready
    KTApp_init();

    // // Called on $(document).ready
    // KTDemoPanel_init();

    // Called on $(document).ready
    KTLayout_init();

    // Called on $(document).ready
    KTQuickPanel_init();

    this
        ._quickPanelButtons
        .addAll(MetronicHeaderBarQuickpanelButtonComponent.queryAll(this._el));
  }

  @override
  void ngOnInit() {}

  @override
  void ngAfterContentInit() {
    if (this._contentTemplate == null) {
      throw Exception("Application contentTemplate is not set (required)");
    }
    if (this._headerBarItemsTemplate == null) {
      throw Exception(
          "Application headerBarItemsTemplate is not set (required)");
    }
    if (this._headerMenuItemsTemplate == null) {
      throw Exception(
          "Application headerMenuItemsTemplate is not set (required)");
    }
    if (this._sideMenuItemsTemplate == null) {
      throw Exception("Application sideMenuItemsTemplate is not set (required)");
    }
    // Timer.periodic(Duration(seconds: 1), (_) {
    //   final btns =
    //       MetronicHeaderBarQuickpanelButtonComponent.queryAll(this._el);
    //   print(btns);
    //   for (final headerBarQuickpanelButton in btns) {
    //     print(headerBarQuickpanelButton);
    //   }
    // });
  }
}

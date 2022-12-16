import "dart:html" show Element, ElementList;

import "package:ngdart/angular.dart"
    show
        AfterContentInit,
        Component,
        ContentChild,
        Directive,
        OnInit,
        TemplateRef,
        coreDirectives;

import "../dashboard_contract.dart" show HeaderBarQuickpanelButtonComponent;
import "internal/elements_map.dart" show elementsMap;

@Directive(selector: "[metronicapp-quickpanel-content]")
class QuickPanelContentDirective {}

const List<Type> metronicHeaderBarQuickpanelButtonDirectives = <Type>[
  QuickPanelContentDirective,
];

@Component(
    selector: "metronicapp-header-bar-quickpanel-button",
    templateUrl: "header_bar_quickpanel_button.html",
    directives: <Object>[
      coreDirectives,
    ],
    styleUrls: <String>[])
class MetronicHeaderBarQuickpanelButtonComponent
    extends HeaderBarQuickpanelButtonComponent
    implements AfterContentInit, OnInit {
  @ContentChild(QuickPanelContentDirective, read: TemplateRef)
  set quickPanelContentTemplate(TemplateRef value) {
    this._quickPanelContentTemplate = value;
  }

  @override
  TemplateRef get quickPanelContentTemplate => this._quickPanelContentTemplate;

  @override
  String get quickPanelId => this._quickPanelId;

  @override
  String get quickPanelCloseButtonId => this._quickPanelCloseButtonId;

  @override
  String get quickPanelToggleButtonId => this._quickPanelToggleButtonId;

  static List<MetronicHeaderBarQuickpanelButtonComponent> queryAll(
      Element queryRootElement) {
    final ElementList<Element> elements =
        queryRootElement.querySelectorAll(_ELEMENT_CLASSIFIER_CLASS);

    List<MetronicHeaderBarQuickpanelButtonComponent> children =
        elements.map((Element element) {
      final Object component = elementsMap[element];
      if (component == null) {
        throw Exception(
            "Broken element '$_ELEMENT_CLASSIFIER_CLASS' detected. The element is not registered in elementsMap.");
      }

      if (!(component is MetronicHeaderBarQuickpanelButtonComponent)) {
        throw Exception(
            "Broken element '$_ELEMENT_CLASSIFIER_CLASS' detected. Not expected component class '${component.runtimeType}' (expected '${MetronicHeaderBarQuickpanelButtonComponent}').");
      }

      final MetronicHeaderBarQuickpanelButtonComponent friendlyComponent =
          component;

      return friendlyComponent;
    }).toList(growable: false);

    return children;
  }

  factory MetronicHeaderBarQuickpanelButtonComponent(Element el) {
    return MetronicHeaderBarQuickpanelButtonComponent._(
      el,
      ++MetronicHeaderBarQuickpanelButtonComponent._instanceCounter,
    );
  }

  MetronicHeaderBarQuickpanelButtonComponent._(Element el, int instanceNumber)
      : _quickPanelId = _QUICKPANEL_ID_PREFIX + instanceNumber.toString(),
        _quickPanelCloseButtonId =
            _QUICKPANEL_ID_PREFIX + "closebutton_" + instanceNumber.toString(),
        _quickPanelToggleButtonId =
            _QUICKPANEL_ID_PREFIX + "togglebutton_" + instanceNumber.toString(),
        super(el) {
    elementsMap[el] = this;

    this.el.classes.add(_ELEMENT_CLASSIFIER_CLASS);

    this.el.classes.add("kt-header__topbar-item");
    // this.el.classes.add("kt-header__topbar-item--quick-panel");

    this.el.attributes["data-toggle"] = "kt-tooltip";
    this.el.attributes["data-placement"] = "right";

    this.el.attributes["title"] = "";

    // class="kt-header__topbar-item kt-header__topbar-item--quick-panel"
    // data-toggle="kt-tooltip"
    // title=""
    // data-placement="right"
    // data-original-title="Quick panel"
  }

  @override
  void ngOnInit() {
    if (this._quickPanelContentTemplate == null) {
      throw Exception(
          "HeaderBarQuickpanelButton quickPanelContentTemplate is not set (required)");
    }
  }

  TemplateRef _quickPanelContentTemplate;
  final String _quickPanelId;
  final String _quickPanelCloseButtonId;
  final String _quickPanelToggleButtonId;

  static const String _ELEMENT_CLASSIFIER_CLASS =
      ".header-bar-quickpanel-button";
  static const String _QUICKPANEL_ID_PREFIX = "header-bar-quickpanel-button-";
  static int _instanceCounter = 0;

  @override
  void ngAfterContentInit() {
    if (this.tooltip != null) {
      this.el.attributes["data-original-title"] = this.tooltip;
    }
  }
}

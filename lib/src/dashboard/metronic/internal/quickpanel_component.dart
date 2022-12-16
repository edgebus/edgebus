import "dart:html" show Element;

import "package:ngdart/angular.dart"
    show
        AfterContentInit,
        AfterViewInit,
        Component,
        Input,
        OnDestroy,
        TemplateRef,
        coreDirectives;

import "../../dashboard_contract.dart" show BaseComponent;
import 'interop.dart';

@Component(
    selector: "metronicapp-quickpanel",
    templateUrl: "quickpanel_component.html",
    directives: <Object>[
      coreDirectives,
    ],
    styleUrls: <String>[])
class QuickpanelComponent extends BaseComponent
    implements AfterContentInit, AfterViewInit, OnDestroy {
  @Input()
  TemplateRef quickPanelContentTemplate;

  @Input()
  String quickPanelId;

  @Input()
  String quickPanelCloseButtonId;

  @Input()
  String quickPanelToggleButtonId;

  QuickpanelComponent(Element el) : super(el) {
    this.el.classes.add("kt-quick-panel");
  }

  @override
  void ngAfterContentInit() {}

  @override
  void ngAfterViewInit() {
    this.el.id = this.quickPanelId;
    this._KTOffcanvas = KTOffcanvasFactory(this.quickPanelId, "kt-quick-panel",
        this.quickPanelCloseButtonId, this.quickPanelToggleButtonId);
  }

  @override
  void ngOnDestroy() {
    this._KTOffcanvas = null;
  }

  Object _KTOffcanvas; // hold instance to prevent garbage collection
}

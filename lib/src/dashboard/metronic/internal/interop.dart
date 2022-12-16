@JS()
library metronic_application;

import 'dart:js';

import "package:js/js.dart";

@JS()
external void KTApp_init();

@JS()
external void KTUtil_init();

@JS()
external void KTChat_init();

@JS()
external void KTDemoPanel_init();

@JS()
external void KTLayout_init();

@JS()
external void KTOffcanvasPanel_init();

@JS()
external void KTQuickPanel_init();

@JS()
external JsObject KTOffcanvasFactory(
  String panelId,
  String baseClassName,
  String closeByButtonId,
  String toggleByButtonId,
);

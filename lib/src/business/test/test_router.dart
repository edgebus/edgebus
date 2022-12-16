import "package:ngrouter/ngrouter.dart" show RouteDefinition, RoutePath;
import "page1/page1.template.dart" as page1_template;
import "page2/page2.template.dart" as page2_template;

class TestRoutePaths {
  static final RoutePath testPage1 = RoutePath(path: "test/page1");
  static final RoutePath testPage2 = RoutePath(path: "test/page2");
}

class TestRoutes {
  static final RouteDefinition testPage1 = RouteDefinition(
    routePath: TestRoutePaths.testPage1,
    component: page1_template.Page1ComponenetNgFactory,
  );

  static final RouteDefinition testPage2 = RouteDefinition(
    routePath: TestRoutePaths.testPage2,
    component: page2_template.Page2ComponenetNgFactory,
  );

  static final List<RouteDefinition> all = <RouteDefinition>[
    testPage1,
    testPage2,
  ];
}

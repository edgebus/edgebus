import 'package:console_app/src/business/test/test_router.dart';
import 'package:ngdart/angular.dart';
import 'package:ngrouter/ngrouter.dart';

import 'src/dashboard/metronic/metronic.dart';

// AngularDart info: https://angulardart.xyz
// Components info: https://angulardart.xyz/components
//
// (If the links still point to the old Dart-lang repo, go here:
// https://pub.dev/ngcomponents)

@Component(
    selector: 'my-app',
    styleUrls: ['app_component.css'],
    templateUrl: 'app_component.html',
    directives: [
      metronicDirectives,
      coreDirectives,
      routerDirectives,
      MetronicApplicationComponent,
      MetronicHeaderBarExpandButtonComponent,
      MetronicHeaderBarQuickpanelButtonComponent,
      MetronicHeaderMenuLinkComponent,
      MetronicSideMenuLinkComponent,
      MetronicSideMenuSectionComponent,
    ],
    providers: <Object>[routerProviders])
class AppComponent {
  final List<RouteDefinition> allRoutes = <RouteDefinition>[
    ...TestRoutes.all,
    RouteDefinition.redirect(
      // https://angulardart.dev/guide/router/2#redirect-routehttps://angulardart.dev/guide/router/2#redirect-route
      path: ".*",
      redirectTo: TestRoutePaths.testPage1.toUrl(),
    ),
  ];

  String get testPage1Url => TestRoutePaths.testPage1.toUrl();
  String get testPage2Url => TestRoutePaths.testPage2.toUrl();
  // Nothing here yet. All logic is in TodoListComponent.
}

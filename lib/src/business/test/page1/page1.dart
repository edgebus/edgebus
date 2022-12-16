import 'package:ngdart/angular.dart';
import 'package:ngforms/ngforms.dart';

import '../../../dashboard/metronic/basic_table.dart';
import '../../../dashboard/metronic/button.dart';
import '../../../dashboard/metronic/portlet.dart';

@Component(
  selector: "page1",
  templateUrl: "page1.html",
  directives: <Object>[
    coreDirectives,
    formDirectives,
    BasicTableComponent,
    basicTableDirectives,
    ButtonComponent,
    PortletComponent,
    portletDirectives,
  ],
)
class Page1Componenet extends OnInit {
  @override
  void ngOnInit() {
    // TODO: implement ngOnInit
  }
  void handleButtonClick() {
    print("Button click");
  }

  List<TestViewObj> data = [
    new TestViewObj("column1", "column2", "column3", "column4"),
    new TestViewObj("2column1", "2column2", "2column3", "2column4"),
  ];
}

class TestViewObj {
  final String column1;
  final String column2;
  final String column3;
  final String column4;

  TestViewObj(
    this.column1,
    this.column2,
    this.column3,
    this.column4,
  ) {}
}

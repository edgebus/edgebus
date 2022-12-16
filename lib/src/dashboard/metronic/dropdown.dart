import "dart:math" show Random;
import "package:ngdart/angular.dart"
    show
        Component,
        ContentChild,
        Directive,
        Input,
        NgTemplateOutlet,
        TemplateRef,
        coreDirectives;

import "internal/toastr.dart" show toastr;

@Directive(selector: "[dropdownItems]")
class DropdownItemsDirective {}

const List<Type> dropdownDirectives = <Type>[
  DropdownItemsDirective,
];

@Component(
    selector: "metronicapp-dropdown",
    templateUrl: "dropdown.html",
    directives: <Object>[
      NgTemplateOutlet,
      coreDirectives,
    ],
    styleUrls: <String>[])
class DropdownComponent {
  @Input()
  String title = "Title";

  @Input()
  bool small;

  @Input()
  String type;

  @Input()
  String classes;

  @ContentChild(DropdownItemsDirective, read: TemplateRef)
  TemplateRef items;

  String get dropdownClass {
    List<String> dropdownClass = <String>["btn", "dropdown-toggle"];
    if (this.type != null) {
      dropdownClass.add("btn-${this.type}");
    }
    if (this.small == true) {
      dropdownClass.add("btn-sm");
    }
    if (this.classes != null) {
      List<String> addClasses = this.classes.split(" ");
      dropdownClass.addAll(addClasses);
    }
    return dropdownClass.join(" ");
  }
}

@Component(
    selector: "metronicapp-dropdown-item",
    template:
        '''<a (click)="handleClick" class="dropdown-item">{{title}}</a>''',
    directives: <Object>[
      NgTemplateOutlet,
      coreDirectives,
    ],
    styleUrls: <String>[])
class DropdownItemComponent {
  @Input()
  String title = "Title";

  @Input()
  Function action;

  @Input()
  dynamic param;

  bool _actionWait = false;

  int componentId;

  DropdownItemComponent() : componentId = Random().nextInt(1000000);

  String get dropdownMenuButtonId =>
      "dropdownMenuButton${this.componentId.toString()}";

  void handleClick() async {
    if (this.action != null) {
      this._actionWait = true;
      try {
        if (this.param != null) {
          await this.action(this.param);
        } else {
          await this.action();
        }
      } catch (e) {
        toastr.error(e.toString());
      }
      this._actionWait = false;
    }
  }
}

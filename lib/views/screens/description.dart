// ignore_for_file: unnecessary_this

import 'package:edgebus_console/api/api_client.dart';
import 'package:edgebus_console/api/api_client_mock.dart';
// import 'package:edgebus_console/model/topic.dart';
// import 'package:edgebus_console/model/topic_id.dart';
import 'package:edgebus_console/views/widgets/portal_master_layout/portal_master_layout.dart';
import 'package:flutter/material.dart';
// import 'package:freemework/execution_context/f_execution_context.dart';
// import 'package:freemework/freemework.dart';

class DescriptionScreen extends StatefulWidget {
  final ApiClient apiClient = ApiClientMock();

  DescriptionScreen({Key? key}) : super(key: key);

  @override
  State<DescriptionScreen> createState() => _DescriptionScreen();
}

class _DescriptionScreen extends State<DescriptionScreen> {
  // final _formKey = GlobalKey<FormBuilderState>();

  // this.widget.apiClient.listTopics(FExecutionContext.defaultExecutionContext);

  Future<String> getDescription() {
    return Future.delayed(const Duration(seconds: 3), () => "Description-get");
  }

  // Future<String> getDescription() async {
  //   final Future<String> description =
  //       this.widget.apiClient.updateTopicDescription(
  //             FExecutionContext.defaultExecutionContext,
  //             topicId,
  //             newDescription,
  //           );
  //   await Future.delayed(const Duration(seconds: 6), () {});
  //   return description;
  // }

  void printDescription() {
    print("Description...");
  }

  @override
  Widget build(BuildContext context) {
    // final ButtonStyle style = ButtonStyle(
    //   backgroundColor: MaterialStateProperty.all(Colors.blue),
    //   // padding: MaterialStateProperty.all(const EdgeInsets.all(0)),
    //   // minimumSize: MaterialStateProperty.all(const Size(60, 60)),
    //   // shape: MaterialStateProperty.all(RoundedRectangleBorder(
    //   //   borderRadius: BorderRadius.circular(50.0),
    //   //   side: const BorderSide(color: Colors.black),
    //   // )),
    // );

    // final String usersStr = topics.toString();
    // final lang = Lang.of(context);
    // final themeData = Theme.of(context);
    // final appColorScheme = themeData.extension<AppColorScheme>()!;
    // final List<int> colorCodes = <int>[600, 400, 200];
    const List<String> messages = <String>[
      "Messages in the last hour: 5",
      "Messages in the last 24 hours: 43",
      "Last massege: 2023-23-11 12:00:00",
    ];

    return PortalMasterLayout(
      body: ListView.separated(
        padding: const EdgeInsets.only(left: 40, top: 20),
        itemCount: messages.length,
        itemBuilder: (BuildContext context, int index) {
          return Row(
            children: [
              Container(
                width: 400,
                height: 50,
                color: Colors.grey[400],
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Text(messages[index].toString(),
                      style:
                          const TextStyle(fontSize: 22, color: Colors.black)),
                ),
              ),
              const SizedBox(
                width: 20,
              ),
              ElevatedButton(
                child: const Icon(
                  Icons.arrow_back_rounded,
                ),
                onPressed: () {
                  Navigator.pop(context);
                },
              ),
            ],
          );
        },
        separatorBuilder: (BuildContext context, int index) => const Divider(
          height: 20,
          thickness: 0,
          indent: 0,
          endIndent: 1170,
          color: Colors.black,
        ),
      ),
    );
  }
}

    // return const PortalMasterLayout(
    //   body: Text(
    //     "Ololo",
    //     style: TextStyle(
    //         fontSize: 16, color: Colors.red, fontWeight: FontWeight.w800),
    //   ),
    // );


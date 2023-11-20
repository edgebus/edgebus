// ignore_for_file: unnecessary_this

import 'package:edgebus_console/api/api_client.dart' show ApiClient;
import 'package:edgebus_console/api/api_client_mock.dart' show ApiClientMock;
import 'package:edgebus_console/views/widgets/portal_master_layout/portal_master_layout.dart'
    show PortalMasterLayout;
import 'package:flutter/material.dart';

class ActionScreen extends StatefulWidget {
  final ApiClient apiClient = ApiClientMock();

  ActionScreen({Key? key}) : super(key: key);

  @override
  State<ActionScreen> createState() => _ActionScreen();
}

class _ActionScreen extends State<ActionScreen> {
  // final _formKey = GlobalKey<FormBuilderState>();

  // this.widget.apiClient.listTopics(FExecutionContext.defaultExecutionContext);

  // Future<String> getTopicAction() async {
  //   final Future<String> messages =
  //       this.widget.apiClient.updateTopicDescription(
  //             FExecutionContext.defaultExecutionContext,
  //             topicId,
  //             newDescription,
  //           );
  //   await Future.delayed(const Duration(seconds: 6), () {});
  //   return messages;
  // }

  Future<String> getTopicAction() async {
    const String messages = "Action";
    await Future.delayed(const Duration(seconds: 6), () {});
    return messages;
  }

  @override
  Widget build(BuildContext context) {
    // final String usersStr = topics.toString();
    // final lang = Lang.of(context);
    // final ThemeData themeData = Theme.of(context);
    // final appColorScheme = themeData.extension<AppColorScheme>()!;

    return PortalMasterLayout(
      body: ListView(
        padding: const EdgeInsets.only(left: 10, top: 10),
        children: const <Widget>[
          Row(children: [
            Center(
              child: Text("Created"),
            ),
            SizedBox(
              width: 20,
            ),
            Icon(Icons.create_new_folder_sharp),
          ]),
          Divider(
            height: 20,
            thickness: 0,
            indent: 0,
            endIndent: 10,
            color: Colors.grey,
          ),
          Row(children: [
            Center(
              child: Text("Delete"),
            ),
            SizedBox(
              width: 20,
            ),
            Icon(Icons.delete),
          ]),
        ],
      ),
    );
    // return PortalMasterLayout(
    //   body: ListView(
    //     padding: const EdgeInsets.only(top: 20.0),
    //     children: <Widget>[
    //       Row(
    //         children: [
    //           Container(
    //             width: 150,
    //             height: 50,
    //             color: Colors.grey[400],
    //             child: const Center(
    //               child: Text("Create topic",
    //                   style: TextStyle(fontSize: 22, color: Colors.black)),
    //             ),
    //           ),
    //           const SizedBox(
    //             width: 20,
    //           ),
    //           ElevatedButton(
    //             child: const Icon(
    //               Icons.create_new_folder_sharp,
    //             ),
    //             onPressed: () {
    //               print("Create!");
    //             },
    //           ),
    //           const SizedBox(
    //             width: 20,
    //           ),
    //           Row(
    //             children: [
    //               Container(
    //                 width: 150,
    //                 height: 50,
    //                 color: Colors.grey[400],
    //                 child: const Center(
    //                   child: Text("Delete topic",
    //                       style: TextStyle(fontSize: 22, color: Colors.black)),
    //                 ),
    //               ),
    //               const SizedBox(
    //                 width: 20,
    //               ),
    //               ElevatedButton(
    //                 child: const Icon(
    //                   Icons.delete,
    //                 ),
    //                 onPressed: () {
    //                   print("Delete!");
    //                 },
    //               ),
    //             ],
    //           )
    //         ],
    //       ),
    //     ],
    //   ),
    // );
  }
}

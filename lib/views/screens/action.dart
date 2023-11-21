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
      body: Padding(
        padding: const EdgeInsets.only(
            top: 5.0, left: 2.0, right: 10.0, bottom: 10.0),
        child: DataTable(
          columns: const <DataColumn>[
            DataColumn(
              label: Expanded(
                child: Text(
                  'id',
                  style: TextStyle(
                      color: Colors.grey, fontStyle: FontStyle.italic),
                ),
              ),
            ),
          ],
          rows: const <DataRow>[
            DataRow(
              cells: <DataCell>[
                DataCell(Text('19-id')),
              ],
            ),
            DataRow(
              cells: <DataCell>[
                DataCell(
                  Text(
                    'topic',
                    style: TextStyle(
                        color: Colors.grey, fontStyle: FontStyle.italic),
                  ),
                ),
              ],
            ),
            DataRow(
              cells: <DataCell>[
                DataCell(Text('topic-1')),
              ],
            ),
            DataRow(
              cells: <DataCell>[
                DataCell(
                  Text(
                    'description',
                    style: TextStyle(
                        color: Colors.grey, fontStyle: FontStyle.italic),
                  ),
                ),
              ],
            ),
            DataRow(
              cells: <DataCell>[
                DataCell(
                  Text(
                    'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.',
                  ),
                ),
              ],
            ),
          ],
        ),
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

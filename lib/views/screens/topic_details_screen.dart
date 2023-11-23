// ignore_for_file: unnecessary_this

import 'package:edgebus_console/api/api_client.dart' show ApiClient;
import 'package:edgebus_console/model/topic.dart' show Topic;
import 'package:edgebus_console/views/widgets/portal_master_layout/portal_master_layout.dart'
    show PortalMasterLayout;
import 'package:flutter/material.dart';

class TopicDetailsScreenOpts {
  final Topic topic;
  final bool isEdit;

  const TopicDetailsScreenOpts(this.topic, this.isEdit);
}

class TopicDetailsScreen extends StatefulWidget {
  final ApiClient apiClient;
  final TopicDetailsScreenOpts? opts;

  const TopicDetailsScreen(
    this.apiClient, {
    this.opts,
    Key? key,
  }) : super(key: key);

  @override
  State<TopicDetailsScreen> createState() => _ActionScreen();
}

class _ActionScreen extends State<TopicDetailsScreen> {
  // final TopicDetailsScreen editTopic = TopicDetailsScreen();
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
  final TextEditingController _descriptionController = TextEditingController();
  @override
  void initState() {
    super.initState();
    final TopicDetailsScreenOpts? opts = this.widget.opts;
    if (opts != null) {
      this._descriptionController.text = opts.topic.description;
    }
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<String> getTopicAction() async {
    const String messages = "Action";
    return messages;
  }

  @override
  Widget build(BuildContext context) {
    // final String usersStr = topics.toString();
    // final lang = Lang.of(context);
    // final ThemeData themeData = Theme.of(context);
    // final appColorScheme = themeData.extension<AppColorScheme>()!;

    final Topic? currentTopic = null; //  this.widget.topic;

    return PortalMasterLayout(
      body: Padding(
        padding: const EdgeInsets.only(
          top: 30.0,
          left: 10.0,
          right: 10.0,
        ),
        child: Column(
          children: [
            Table(
              border: TableBorder.all(),
              columnWidths: const <int, TableColumnWidth>{
                0: IntrinsicColumnWidth(),
                1: FlexColumnWidth(),
                // 2: FixedColumnWidth(64),
              },
              defaultVerticalAlignment: TableCellVerticalAlignment.middle,
              children: <TableRow>[
                TableRow(
                  children: <Widget>[
                    const TableCell(
                      verticalAlignment: TableCellVerticalAlignment.middle,
                      child: SizedBox(
                        height: 50,
                        width: 100,
                        child: Center(
                          child: Text("id"),
                        ),
                      ),
                    ),
                    TableCell(
                      verticalAlignment: TableCellVerticalAlignment.middle,
                      child: SizedBox(
                        height: 50,
                        width: 300,
                        child: Center(
                          child: Text(this.widget.opts!.topic.id),
                        ),
                      ),
                    ),
                  ],
                ),
                TableRow(
                  children: <Widget>[
                    const TableCell(
                      verticalAlignment: TableCellVerticalAlignment.middle,
                      child: SizedBox(
                        height: 50,
                        width: 100,
                        child: Center(
                          child: Text("topic"),
                        ),
                      ),
                    ),
                    TableCell(
                      verticalAlignment: TableCellVerticalAlignment.middle,
                      child: SizedBox(
                        height: 50,
                        width: 300,
                        child: Center(
                          child: Text(this.widget.opts!.topic.name),
                        ),
                      ),
                    ),
                  ],
                ),
                TableRow(
                  children: <Widget>[
                    const TableCell(
                      verticalAlignment: TableCellVerticalAlignment.middle,
                      child: SizedBox(
                        height: 50,
                        width: 100,
                        child: Center(
                          child: Text("description"),
                        ),
                      ),
                    ),
                    TableCell(
                      verticalAlignment: TableCellVerticalAlignment.middle,
                      child: SizedBox(
                        height: 50,
                        width: 300,
                        child: Center(
                            child: TextFormField(
                          // minLines: 3,
                          controller: _descriptionController,
                        )

                            // Text(this.widget.opts!.topic.description),
                            ),
                      ),
                    ),
                  ],
                ),
              ],

              // ElevatedButton(
              //   onPressed: () {
              //     Navigator.pop(context);
              //   },
              //   child: const Icon(Icons.arrow_back),
              // ),
              //   DataTable(
              //     columns: const <DataColumn>[
              //       DataColumn(
              //         label: Expanded(
              //           child: Text(
              //             'id',
              //             style: TextStyle(
              //                 color: Colors.grey, fontStyle: FontStyle.italic),
              //           ),
              //         ),
              //       ),
              //     ],
              //     rows: <DataRow>[
              //       if (currentTopic != null)
              //         DataRow(
              //           cells: <DataCell>[
              //             DataCell(Text(currentTopic.id)),
              //           ],
              //         ),
              //       const DataRow(
              //         cells: <DataCell>[
              //           DataCell(
              //             Text(
              //               'topic',
              //               style: TextStyle(
              //                   color: Colors.grey, fontStyle: FontStyle.italic),
              //             ),
              //           ),
              //         ],
              //       ),
              //       const DataRow(
              //         cells: <DataCell>[
              //           DataCell(Text('topic-1')),
              //         ],
              //       ),
              //       const DataRow(
              //         cells: <DataCell>[
              //           DataCell(
              //             Text(
              //               'description',
              //               style: TextStyle(
              //                   color: Colors.grey, fontStyle: FontStyle.italic),
              //             ),
              //           ),
              //         ],
              //       ),
              //       DataRow(
              //         cells: <DataCell>[
              //           DataCell(
              //             TextFormField(
              //                 // initialValue:
              //                 // 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.',
              //                 // // keyboardType: textType,
              //                 // onFieldSubmitted: (val) {},
              //                 // ),
              //                 ),

              //             // Text(
              //             //   'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available.',
              //             // ),
              //           ),
              //         ],
              //       ),
              //     ],
              //   ),
              // ],
            ),

            // ElevatedButton(
            //   onPressed: () {
            //     // Navigator.pop(context);
            //   },
            //   child: const Icon(Icons.save_alt_rounded),
            // ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // setState(() {
          //   // index = (index + 1) % customizations.length;
          // });
        },

        // foregroundColor: customizations[index].$1,
        // backgroundColor: customizations[index].$2,
        // shape: customizations[index].$3,
        child: const Icon(Icons.save_alt_rounded),
      ),
    );
  }
  // );
}
// }

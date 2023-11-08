// ignore_for_file: unnecessary_this

import 'package:edgebus_console/api/api_client.dart';
import 'package:edgebus_console/api/api_client_mock.dart';
import 'package:edgebus_console/model/topic.dart';
import 'package:edgebus_console/views/screens/action.dart';
import 'package:edgebus_console/views/widgets/portal_master_layout/portal_master_layout.dart';
import 'package:flutter/material.dart';
import 'package:freemework/execution_context/f_execution_context.dart';
// import 'package:freemework/freemework.dart';

import 'package:data_table_2/data_table_2.dart';
// import 'package:flutter/rendering.dart';

class TopicScreen extends StatefulWidget {
  final ApiClient apiClient = ApiClientMock();

  TopicScreen({Key? key}) : super(key: key);

  @override
  State<TopicScreen> createState() => _TopicScreenState();
}

class _TopicScreenState extends State<TopicScreen> {
  // final _formKey = GlobalKey<FormBuilderState>();

  // this.widget.apiClient.listTopics(FExecutionContext.defaultExecutionContext);

  // @override
  // Future<List<Topic>>? topics;
  // initState() {
  //   topics = this
  //       .widget
  //       .apiClient
  //       .listTopics(FExecutionContext.defaultExecutionContext);
  //   // print(topics);
  // }

  Future<List<Topic>> getList() async {
    final Future<List<Topic>> topics = this
        .widget
        .apiClient
        .listTopics(FExecutionContext.defaultExecutionContext);
    await Future.delayed(const Duration(seconds: 6), () {});
    return topics;
  }

  @override
  Widget build(BuildContext context) {
    final ButtonStyle actionBottonStyle = ButtonStyle(
      backgroundColor: MaterialStateProperty.all(Colors.grey.shade200),
      // padding: MaterialStateProperty.all(const EdgeInsets.all(0)),
      minimumSize: MaterialStateProperty.all(const Size(30, 50)),
      // shape: MaterialStateProperty.all(RoundedRectangleBorder(
      //   borderRadius: BorderRadius.circular(50.0),
      //   side: const BorderSide(color: Colors.black),
      // )),
    );

    // final String usersStr = topics.toString();
    // final lang = Lang.of(context);
    // final themeData = Theme.of(context);
    // final appColorScheme = themeData.extension<AppColorScheme>()!;
    // final List<int> colorCodes = <int>[600, 400, 200];

    return PortalMasterLayout(
      body: FutureBuilder(
        future: this.getList(),
        // initialData: "Code sample",
        builder: (BuildContext context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            if (snapshot.hasError) {
              return Center(
                child: Text(
                  'An ${snapshot.error} occurred',
                  style: const TextStyle(fontSize: 18, color: Colors.red),
                ),
              );
            }
            return const Center(
              child: CircularProgressIndicator(
                strokeWidth: 2, // вказує товщину CircularProgressIndicator
                backgroundColor: Colors.grey,
                valueColor: AlwaysStoppedAnimation(Colors.blue),
              ),
            );
          }
          if (snapshot.connectionState == ConnectionState.done &&
              snapshot.hasData) {
            final List<Topic> topics = snapshot.data!;

            return Padding(
              padding: const EdgeInsets.all(16),
              child: DataTable2(
                columnSpacing: 12,
                horizontalMargin: 12,
                // isVerticalScrollBarVisible: true,
                minWidth: 200,
                headingRowColor: MaterialStateColor.resolveWith(
                    (states) => Colors.grey.shade400),
                columns: const [
                  DataColumn2(
                    label: Text('id'),
                    // size: ColumnSize.L,
                  ),
                  DataColumn(
                    label: Text('topics'),
                  ),
                  DataColumn(
                    label: Text('description_1'),
                  ),
                  DataColumn(
                    label: Text('description_2'),
                  ),
                  DataColumn(
                    label: Text('actions'),
                    numeric: true,
                  ),
                ],
                rows: List<DataRow>.generate(
                  3,
                  (index) {
                    final Topic topic = topics[index];
                    return DataRow(
                      cells: [
                        DataCell(
                          Text(topic.id),
                        ),
                        DataCell(
                          Text(topic.name),
                        ),
                        DataCell(
                          Text(topic.description),
                        ),
                        DataCell(
                          Text(topic.description),
                        ),
                        DataCell(
                          ElevatedButton(
                            style: actionBottonStyle,
                            child: const Icon(
                              Icons.more_horiz,
                              color: Colors.black,
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (context) => ActionScreen()),
                              );
                            },
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            );

            // ListView.separated(
            //   padding: const EdgeInsets.only(left: 10, top: 20),
            //   itemCount: topics.length,
            //   itemBuilder: (BuildContext context, int index) {
            //     final Topic topic = topics[index];
            //     return Row(
            //         mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            //         children: [
            //           Container(
            //             width: 200,
            //             height: 50,
            //             color: Colors.grey[400],
            //             child: Center(
            //               child: Text(
            //                 topic.id,
            //                 textAlign: TextAlign.center,
            //                 style: const TextStyle(
            //                   fontSize: 12,
            //                   color: Colors.black,
            //                 ),
            //               ),
            //             ),
            //           ),
            //           Container(
            //             width: 200,
            //             height: 50,
            //             color: Colors.grey[400],
            //             child: Center(
            //               child: Text(
            //                 topic.name,
            //                 style: const TextStyle(
            //                   fontSize: 12,
            //                   color: Colors.black,
            //                 ),
            //               ),
            //             ),
            //           ),
            // ElevatedButton(
            //   style: style,
            //   child: const Icon(
            //     Icons.settings_applications_sharp,
            //   ),
            //           //   onPressed: () {
            //           //     Navigator.push(
            //           //       context,
            //           //       MaterialPageRoute(
            //           //           builder: (context) => DescriptionScreen()),
            //           //     );
            //           //   },
            //           // ),
            //           Container(
            //             width: 200,
            //             height: 50,
            //             color: Colors.grey[400],
            //             child: Center(
            //               child: Text(topic.description,
            //                   style: const TextStyle(
            //                       fontSize: 12, color: Colors.black)),
            //             ),
            //           ),
            //           Container(
            //             width: 200,
            //             height: 50,
            //             color: Colors.grey[400],
            //             child: Center(
            //               child: Text(topic.description,
            //                   style: const TextStyle(
            //                       fontSize: 12, color: Colors.black)),
            //             ),
            //           ),
            //           ElevatedButton(
            //             style: style,
            //             child: const Icon(
            //               Icons.arrow_right_sharp,
            //             ),
            //             onPressed: () {
            // Navigator.push(
            //   context,
            //   MaterialPageRoute(
            //       builder: (context) => ActionScreen()),
            // );
            //             },
            //           ),
            //         ]);
            //   },
            //   separatorBuilder: (BuildContext context, int index) =>
            //       const Divider(
            //     height: 20,
            //     thickness: 2,
            //     indent: 0,
            //     endIndent: 10,
            //     color: Colors.grey,
            //   ),
            // );
          }
          return const Center(
            child: CircularProgressIndicator(
              // strokeWidth: 2, // вказує товщину CircularProgressIndicator
              backgroundColor: Colors.grey,
              valueColor: AlwaysStoppedAnimation(Colors.green),
            ),
          );
        },
      ),
    );
  }
}

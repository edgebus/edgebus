// ignore_for_file: unnecessary_this

import 'package:edgebus_console/api/api_client.dart' show ApiClient;
import 'package:edgebus_console/api/api_client_mock.dart' show ApiClientMock;
import 'package:edgebus_console/model/topic.dart' show Topic;
import 'package:edgebus_console/views/screens/action.dart' show ActionScreen;
import 'package:edgebus_console/views/widgets/portal_master_layout/portal_master_layout.dart'
    show PortalMasterLayout;
import 'package:flutter/material.dart';
import 'package:freemework/execution_context/f_execution_context.dart'
    show FExecutionContext;
import 'package:adaptive_scrollbar/adaptive_scrollbar.dart'
    show AdaptiveScrollbar, ScrollbarPosition;
// import 'package:freemework/freemework.dart';

// import 'package:data_table_2/data_table_2.dart' show DataTable2;
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
      // minimumSize: MaterialStateProperty.all(const Size(30, 50)),
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
            final verticalScrollController = ScrollController();
            final horizontalScrollController = ScrollController();

            return Padding(
                 padding: const EdgeInsets.all(16),
                // ConstrainedBox(
                //   constraints: const BoxConstraints(
                //     minWidth: 200,
                //     maxWidth: double.infinity,
                //   ),
                  child:
                AdaptiveScrollbar(
              underColor: Colors.blueGrey.withOpacity(0.3),
              sliderDefaultColor: Colors.grey.withOpacity(0.7),
              sliderActiveColor: Colors.grey,
              controller: verticalScrollController,
              child: AdaptiveScrollbar(
                controller: horizontalScrollController,
                position: ScrollbarPosition.bottom,
                underColor: Colors.blueGrey.withOpacity(0.3),
                sliderDefaultColor: Colors.grey.withOpacity(0.7),
                sliderActiveColor: Colors.grey,
                child: SingleChildScrollView(
                  controller: verticalScrollController,
                  scrollDirection: Axis.vertical,
                  child: SingleChildScrollView(
                    controller: horizontalScrollController,
                    scrollDirection: Axis.horizontal,
                    // child: Padding(
                    //   padding: const EdgeInsets.all(16),
                      child: DataTable(
                        showCheckboxColumn: false,
                        columnSpacing: 12,
                        horizontalMargin: 12,
                        headingRowColor: MaterialStateColor.resolveWith(
                            (states) => Colors.grey.shade400),
                        columns: const [
                          DataColumn(
                            label: Text('id'),
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
                          topics.length,
                          (index) {
                            final Topic topic = topics[index];
                            return DataRow(
                              cells: [
                                DataCell(
                                  ConstrainedBox(
                                    constraints: const BoxConstraints(
                                        maxWidth: 400, minWidth: 50),
                                    child: Text(topic.id),
                                  ),
                                ),
                                DataCell(
                                  ConstrainedBox(
                                    constraints: const BoxConstraints(
                                        maxWidth: 100, minWidth: 50),
                                    child: Text(topic.name),
                                  ),
                                ),
                                DataCell(
                                  ConstrainedBox(
                                    constraints: const BoxConstraints(
                                        maxWidth: 600, minWidth: 100),
                                    child: Text(topic.description),
                                  ),
                                ),
                                DataCell(
                                  ConstrainedBox(
                                    constraints: const BoxConstraints(
                                        maxWidth: 600, minWidth: 100),
                                    child: Text(topic.description),
                                  ),
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
                                            builder: (context) =>
                                                ActionScreen()),
                                      );
                                    },
                                  ),
                                ),
                              ],
                              onSelectChanged: (bool? value) {
                                // setState(() {
                                // });
                              },
                            );
                          },
                        ),
                      ),
                    ),
                  ),
                ),
              // ),
            ),
             );
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

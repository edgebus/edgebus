// ignore_for_file: unnecessary_this

import 'package:edgebus_console/api/api_client.dart' show ApiClient;
import 'package:edgebus_console/model/topic.dart' show Topic;
import 'package:edgebus_console/views/screens/topic_details_screen.dart'
    show TopicDetailsScreen, TopicDetailsScreenOpts;
import 'package:edgebus_console/views/widgets/portal_master_layout/portal_master_layout.dart'
    show PortalMasterLayout;
import 'package:flutter/material.dart';
import 'package:freemework/execution_context/f_execution_context.dart'
    show FExecutionContext;
import 'package:adaptive_scrollbar/adaptive_scrollbar.dart'
    show AdaptiveScrollbar, ScrollbarPosition;

class TopicScreen extends StatefulWidget {
  final ApiClient apiClient;

  const TopicScreen(this.apiClient, {Key? key}) : super(key: key);

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

// This function call list of topics
  Future<List<Topic>> getList() async {
    final Future<List<Topic>> topics = this
        .widget
        .apiClient
        .listTopics(FExecutionContext.defaultExecutionContext);
    return topics;
  }

  @override
  Widget build(BuildContext context) {
    // final lang = Lang.of(context);
    // final themeData = Theme.of(context);
    // final appColorScheme = themeData.extension<AppColorScheme>()!;

    return PortalMasterLayout(
      body: FutureBuilder(
        future: this.getList(),
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
                strokeWidth: 2, // indicates thickness CircularProgressIndicator
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
            const List<String> list = <String>[
              'Edit',
              'Show',
              'Delete',
            ];

            return Padding(
              padding: const EdgeInsets.only(
                  top: 5.0, left: 2.0, right: 10.0, bottom: 10.0),
              // ConstrainedBox(
              //   constraints: const BoxConstraints(
              //     minWidth: 200,
              //     maxWidth: double.infinity,
              //   ),
              child: AdaptiveScrollbar(
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
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: DataTable(
                          showCheckboxColumn: false,
                          columnSpacing: 12,
                          horizontalMargin: 12,
                          headingRowColor: MaterialStateColor.resolveWith(
                              (states) => Colors.grey.shade400),
                          columns: const [
                            DataColumn(
                              label: Text('actions'),
                            ),
                            DataColumn(
                              label: Text('id'),
                              // numeric: true,
                            ),
                            DataColumn(
                              label: Text('topics'),
                            ),
                            DataColumn(
                              label: Text('description'),
                            ),
                          ],
                          rows: List<DataRow>.generate(
                            topics.length,
                            (index) {
                              final Topic topic = topics[index];
                              return DataRow(
                                cells: [
                                  DataCell(
                                    DropdownButton<String>(
                                      // alignment: Alignment.centerLeft,
                                      focusColor: Colors.transparent,
                                      icon: const Icon(
                                        Icons.more_horiz,
                                        color: Colors.black,
                                      ),
                                      elevation: 16,
                                      style: const TextStyle(
                                        color: Colors.black,
                                      ),
                                      onChanged: (String? value) async {
                                        if (value == 'Delete') {
                                          await this
                                              .widget
                                              .apiClient
                                              .deleteTopic(
                                                FExecutionContext
                                                    .defaultExecutionContext,
                                                topic.id,
                                              );
                                        } else {
                                          // If opts (is not pass) == null, we create a new topic
                                          TopicDetailsScreenOpts? opts = null;
                                          // If opts (pass topic and flag isEdit == true), we can edit topic
                                          if (value == 'Edit') {
                                            opts = TopicDetailsScreenOpts(
                                              topic,
                                              true,
                                            );
                                            // If opts (pass topic and flag isEdit == false), we can show topic
                                          } else if (value == 'Show') {
                                            opts = TopicDetailsScreenOpts(
                                              topic,
                                              false,
                                            );
                                          }
                                          setState(
                                            () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) =>
                                                      TopicDetailsScreen(
                                                    this.widget.apiClient,
                                                    opts: opts,
                                                  ),
                                                ),
                                              );
                                            },
                                          );
                                        }
                                      },
                                      items: list.map<DropdownMenuItem<String>>(
                                          (String value) {
                                        return DropdownMenuItem<String>(
                                          value: value,
                                          child: Text(value),
                                        );
                                      }).toList(),
                                    ),
                                    // ElevatedButton(
                                    //   style: actionBottonStyle,
                                    //   child: const Icon(
                                    //     Icons.more_horiz,
                                    //     color: Colors.black,
                                    //   ),
                                    //   onPressed: () {
                                    //     Navigator.push(
                                    //       context,
                                    //       MaterialPageRoute(
                                    //           builder: (context) =>
                                    //               ActionScreen()),
                                    //     );
                                    //   },
                                    // ),
                                  ),
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
              ),
            );
          }
          return const Center(
            child: CircularProgressIndicator(
              strokeWidth: 2,
              backgroundColor: Colors.grey,
              valueColor: AlwaysStoppedAnimation(Colors.green),
            ),
          );
        },
      ),
    );
  }
}

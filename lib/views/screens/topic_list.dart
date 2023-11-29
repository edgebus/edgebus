// ignore_for_file: unnecessary_this

import 'package:flutter/material.dart';
import 'package:edgebus_console/constants/dimens.dart';
import 'dart:math' show Random;
import 'package:edgebus_console/api/api_client.dart' show ApiClient;
import 'package:edgebus_console/generated/l10n.dart' show Lang;
import 'package:edgebus_console/model/topic.dart' show Topic;
import 'package:edgebus_console/views/screens/topic_details_screen.dart'
    show TopicDetailsScreen, TopicDetailsScreenOpts;
import 'package:edgebus_console/views/widgets/card_elements.dart'
    show CardHeader, CardBody;
import 'package:edgebus_console/views/widgets/portal_master_layout/portal_master_layout.dart'
    show PortalMasterLayout;
import 'package:freemework/execution_context/f_execution_context.dart'
    show FExecutionContext;

class TopicScreen extends StatefulWidget {
  final ApiClient apiClient;

  const TopicScreen(this.apiClient, {Key? key}) : super(key: key);

  @override
  State<TopicScreen> createState() => _TopicScreenState();
}

class _TopicScreenState extends State<TopicScreen> {
// This function call topicAction of topics
  Future<List<Topic>> getList() async {
    await Future.delayed(const Duration(seconds: 3));
    final int number = Random().nextInt(5);
    if (number % 2 == 0) {
      final Future<List<Topic>> topics = this
          .widget
          .apiClient
          .listTopics(FExecutionContext.defaultExecutionContext);
      return topics;
    } else {
      throw Exception();
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = Lang.of(context);
    final themeData = Theme.of(context);

    return PortalMasterLayout(
      body: FutureBuilder(
          future: this.getList(),
          builder: (BuildContext context, snapshot) {
            final List<Topic>? topics = snapshot.data;
            if (snapshot.connectionState != ConnectionState.done) {
              return const Center(
                child: CircularProgressIndicator(
                  strokeWidth:
                      2, // indicates thickness CircularProgressIndicator
                  backgroundColor: Colors.grey,
                  valueColor: AlwaysStoppedAnimation(Colors.blue),
                ),
              );
            } else if (topics != null) {
              const List<String> topicAction = <String>[
                'Edit',
                'Show',
                'Delete',
              ];
              return ListView(
                padding: const EdgeInsets.all(kDefaultPadding),
                children: [
                  Text(
                    lang.topic,
                    style: themeData.textTheme.headlineMedium,
                  ),
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(vertical: kDefaultPadding),
                    child: Card(
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          CardHeader(
                            title: lang.forms(1),
                          ),
                          CardBody(
                            child: this._dataTable(topics, topicAction),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            }
            return Center(
              child: Text(
                'An ${snapshot.error} occurred',
                style: const TextStyle(fontSize: 18, color: Colors.red),
              ),
            );
          }),
    );
  }

  DataTable _dataTable(
      final List<Topic> topics, final List<String> topicAction) {
    return DataTable(
      showCheckboxColumn: false,
      columnSpacing: 12,
      horizontalMargin: 12,
      headingRowColor:
          MaterialStateColor.resolveWith((states) => Colors.grey.shade400),
      columns: const [
        DataColumn(
          label: Text('actions'),
        ),
        DataColumn(
          label: Text('id'),
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
                      await this.widget.apiClient.deleteTopic(
                            FExecutionContext.defaultExecutionContext,
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
                              builder: (context) => TopicDetailsScreen(
                                this.widget.apiClient,
                                opts: opts,
                              ),
                            ),
                          );
                        },
                      );
                    }
                  },
                  items:
                      topicAction.map<DropdownMenuItem<String>>((String value) {
                    return DropdownMenuItem<String>(
                      value: value,
                      child: Text(value),
                    );
                  }).toList(),
                ),
              ),
              DataCell(
                ConstrainedBox(
                  constraints:
                      const BoxConstraints(maxWidth: 400, minWidth: 50),
                  child: Text(topic.id),
                ),
              ),
              DataCell(
                ConstrainedBox(
                  constraints:
                      const BoxConstraints(maxWidth: 100, minWidth: 50),
                  child: Text(topic.name),
                ),
              ),
              DataCell(
                ConstrainedBox(
                  constraints:
                      const BoxConstraints(maxWidth: 600, minWidth: 100),
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
    );
  }
}

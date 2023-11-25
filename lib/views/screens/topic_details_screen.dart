// ignore_for_file: unnecessary_this

import 'package:edgebus_console/api/api_client.dart' show ApiClient;
import 'package:edgebus_console/model/topic.dart' show Topic;
import 'package:edgebus_console/model/topic_id.dart';
import 'package:edgebus_console/views/screens/topic.dart';
import 'package:edgebus_console/views/widgets/portal_master_layout/portal_master_layout.dart'
    show PortalMasterLayout;
import 'package:flutter/material.dart';
import 'package:freemework/freemework.dart';

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

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final TopicDetailsScreenOpts? opts = this.widget.opts;

    if (opts != null && opts.isEdit) {
      // this._nameController.text = opts.topic.name;
      this._descriptionController.text = opts.topic.description;
    }
  }

  @override
  void dispose() {
    this._nameController.dispose();
    this._descriptionController.dispose();
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

    final TopicDetailsScreenOpts? opts = this.widget.opts;

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
              },
              defaultVerticalAlignment: TableCellVerticalAlignment.middle,
              children: <TableRow>[
                if (opts != null)
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
                          child: Padding(
                            padding: const EdgeInsets.only(left: 10.0),
                            child: Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                opts.topic.id,
                              ),
                            ),
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
                          child: Text("Name"),
                        ),
                      ),
                    ),
                    TableCell(
                      verticalAlignment: TableCellVerticalAlignment.middle,
                      child: SizedBox(
                        height: 50,
                        width: 300,
                        child: Padding(
                          padding: const EdgeInsets.only(left: 10.0),
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: opts != null
                                ? Text(
                                    opts.topic.name,
                                    // textAlign: TextAlign.center,
                                  )
                                : TextField(
                                    minLines: 1,
                                    maxLines: 1,
                                    controller: this._nameController,
                                  ),
                          ),
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
                          child: Text("Description"),
                        ),
                      ),
                    ),
                    TableCell(
                      verticalAlignment: TableCellVerticalAlignment.middle,
                      child: SizedBox(
                        height: 50,
                        width: 300,
                        child: Padding(
                          padding: const EdgeInsets.only(left: 10.0),
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: opts != null && opts.isEdit == false
                                ? Text(
                                    opts.topic.description,
                                  )
                                : TextField(
                                    minLines: 1,
                                    maxLines: 5,
                                    controller: this._descriptionController,
                                  ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          setState(() async {
            final String description = this._descriptionController.text;
            final ApiClient apiClient = this.widget.apiClient;
            if (opts == null) {
            final String name = this._nameController.text;
              await apiClient.createTopic(
                  FExecutionContext.defaultExecutionContext,
                  name: name,
                  description: description,);
            } else {
            final String id =opts.topic.id;
                await apiClient.updateTopicDescription(
                  FExecutionContext.defaultExecutionContext,
                  id,
                   description,);
            }
            // ignore: use_build_context_synchronously
            Navigator.pop(
              context,
            );
          });
        },
        child: const Icon(Icons.save_alt_rounded),
      ),
    );
  }
}

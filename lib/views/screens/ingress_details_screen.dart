// ignore_for_file: unnecessary_this

import 'package:edgebus_console/api/api_client.dart' show ApiClient;
import 'package:edgebus_console/model/ingress.dart' show Ingress;
import 'package:edgebus_console/model/ingress_http_host.dart' show IngressHttpHost;
import 'package:edgebus_console/model/ingress_web_socket_client.dart' show IngressWebSocketClient;
import 'package:edgebus_console/views/widgets/portal_master_layout/portal_master_layout.dart'
    show PortalMasterLayout;
import 'package:flutter/material.dart';
import 'package:freemework/freemework.dart';

// This class transmits data
// class TopicDetailsScreenOpts {
//   final Topic topic;
//   final bool isEdit;

//   const TopicDetailsScreenOpts(this.topic, this.isEdit);
// }

// This widget interacts with ApiClient when the flags in position true -> we can edit, create topic and position false -> we can show topic
class IngressDetailsScreen extends StatefulWidget {
  final ApiClient apiClient;
  final Ingress ingress;
  final IngressHttpHost ingressHttpHost;
  final IngressWebSocketClient ingressWebSocketClient;
  // final TopicDetailsScreenOpts? opts;

  const IngressDetailsScreen(
    this.apiClient,
    this.ingress,
    this.ingressHttpHost,
    this.ingressWebSocketClient, {
    // this.opts,
    Key? key,
  }) : super(key: key);

  @override
  State<IngressDetailsScreen> createState() => _ActionIngressScreen();
}

class _ActionIngressScreen extends State<IngressDetailsScreen> {
// Create controllers for edit and create name and description fields
  // final TextEditingController _nameController = TextEditingController();
  // final TextEditingController _descriptionController = TextEditingController();

  // @override
  // void initState() {
  //   super.initState();
  //   final TopicDetailsScreenOpts? opts = this.widget.opts;

  //   if (opts != null && opts.isEdit) {
  //     // this._nameController.text = opts.topic.name;
  //     this._descriptionController.text = opts.topic.description;
  //   }
  // }

  // @override
  // void dispose() {
  //   this._nameController.dispose();
  //   this._descriptionController.dispose();
  //   super.dispose();
  // }

  // Future<String> getTopicAction() async {
  //   const String messages = "Action";
  //   return messages;
  // }

  @override
  Widget build(BuildContext context) {
    // final lang = Lang.of(context);
    // final ThemeData themeData = Theme.of(context);
    // final appColorScheme = themeData.extension<AppColorScheme>()!;
    // final TopicDetailsScreenOpts? opts = this.widget.opts;
    final Ingress ingress = this.widget.ingress;
    final IngressHttpHost ingressHttpHost = this.widget.ingressHttpHost;
    final IngressWebSocketClient ingressWebSocketClient = this.widget.ingressWebSocketClient;
    
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
                // if (opts != null)
                   TableRow(
                    children: <Widget>[
                      const TableCell(
                        verticalAlignment: TableCellVerticalAlignment.middle,
                        child: SizedBox(
                          height: 50,
                          width: 100,
                          child: Center(
                            child: Text("Index"),
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
                              child: Text(ingress.index,
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
                          child: Text("Kind"),
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
                            child: Text(ingress.kind),
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
                          child: Text("Target topic id"),
                        ),
                      ),
                    ),
                    TableCell(
                      verticalAlignment: TableCellVerticalAlignment.middle,
                      child: SizedBox(
                        height: 50,
                        width: 200,
                        child: Padding(
                          padding: const EdgeInsets.only(left: 10.0),
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: Text(ingress.target_topic_id),
                            
                            // opts != null && opts.isEdit == false
                            //     ? Text(
                            //         opts.topic.description,
                            //       )
                            //     : TextField(
                            //         minLines: 1,
                            //         maxLines: 10,
                            //         controller: this._descriptionController,
                            //       ),
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
                            child: Text("Path"),
                          ),
                        ),
                      ),
                      TableCell(
                        verticalAlignment: TableCellVerticalAlignment.middle,
                        child: SizedBox(
                          height: 50,
                          width: 200,
                          child: Padding(
                            padding: const EdgeInsets.only(left: 10.0),
                            child: Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                    ingressHttpHost.path,
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
                            child: Text("Url"),
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
                                ingressWebSocketClient.url,
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

            if (ingress.index != null) {
              await this.widget.apiClient.deleteIngress(
                    FExecutionContext.defaultExecutionContext,
                    ingress.index,
                  );
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

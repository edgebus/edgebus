// ignore_for_file: unnecessary_this

import 'package:edgebus_console/api/api_client.dart' show ApiClient;
import 'package:edgebus_console/api/api_client_mock.dart' show ApiClientMock;
import 'package:edgebus_console/views/widgets/portal_master_layout/portal_master_layout.dart' show PortalMasterLayout;
import 'package:flutter/material.dart';

class DescriptionScreen extends StatefulWidget {
  final ApiClient apiClient = ApiClientMock();

  DescriptionScreen({Key? key}) : super(key: key);

  @override
  State<DescriptionScreen> createState() => _DescriptionScreen();
}

class _DescriptionScreen extends State<DescriptionScreen> {
  // final _formKey = GlobalKey<FormBuilderState>();

  // this.widget.apiClient.listTopics(FExecutionContext.defaultExecutionContext);

  // Future<String> getTopicDescription() async {
  //   final Future<String> messages =
  //       this.widget.apiClient.updateTopicDescription(
  //             FExecutionContext.defaultExecutionContext,
  //             topicId,
  //             newDescription,
  //           );
  //   await Future.delayed(const Duration(seconds: 6), () {});
  //   return messages;
  // }

  Future<String> getTopicDescription() async {
    const String messages = "Description";
    await Future.delayed(const Duration(seconds: 6), () {});
    return messages;
  }

  @override
  Widget build(BuildContext context) {
    // final String usersStr = topics.toString();
    // final lang = Lang.of(context);
    // final ThemeData themeData = Theme.of(context);
    // final appColorScheme = themeData.extension<AppColorScheme>()!;

    const List<String> messages = <String>[
      "Description",
    ];

    return PortalMasterLayout(
      body: FutureBuilder(
        future: getTopicDescription(),
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
                // backgroundColor: themeData.scaffoldBackgroundColor,
                backgroundColor: Colors.grey,
                valueColor: AlwaysStoppedAnimation(Colors.blue),
              ),
            );
          }
          if (snapshot.connectionState == ConnectionState.done &&
              snapshot.hasData) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.only(left: 40.0, top: 20.0),
                    itemCount: messages.length,
                    itemBuilder: (BuildContext context, int index) {
                      return Row(children: [
                        Container(
                          width: 350,
                          height: 50,
                          color: Colors.grey[400],
                          child: Center(
                            child: Text(messages[index].toString(),
                                style: const TextStyle(
                                    fontSize: 22, color: Colors.black)),
                          ),
                        ),
                      ]);
                    },
                    separatorBuilder: (BuildContext context, int index) =>
                        const Divider(
                      height: 20,
                      thickness: 0,
                      indent: 0,
                      endIndent: 1220,
                      color: Colors.black,
                    ),
                  ),
                ),
              ],
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

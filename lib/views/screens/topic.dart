// ignore_for_file: unnecessary_this

import 'package:edgebus_console/api/api_client.dart';
import 'package:edgebus_console/api/api_client_mock.dart';
import 'package:edgebus_console/model/topic.dart';
import 'package:edgebus_console/views/widgets/portal_master_layout/portal_master_layout.dart';
import 'package:flutter/material.dart';
import 'package:freemework/execution_context/f_execution_context.dart';
// import 'package:freemework/freemework.dart';

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

  void goTo() {
    print("Go to...");
  }

  @override
  Widget build(BuildContext context) {
    final ButtonStyle style = ButtonStyle(
      backgroundColor: MaterialStateProperty.all(Colors.blue),
      // padding: MaterialStateProperty.all(const EdgeInsets.all(0)),
      // minimumSize: MaterialStateProperty.all(const Size(60, 60)),
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
    const List<String> topics = <String>[
      "my-topic-1",
      "my-topic-2",
      "my-topic-3",
      "my-topic-4",
      "my-topic-5",
      "my-topic-6",
      "my-topic-7",
      "my-topic-8",
      "my-topic-9",
      "my-topic-10",
      "my-topic-11",
      "my-topic-12",
      "my-topic-13",
      "my-topic-14",
      "my-topic-15",
      "my-topic-16",
      "my-topic-17",
      "my-topic-18",
      "my-topic-19",
    ];

    return PortalMasterLayout(
        body: FutureBuilder(
            future: getList(),
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
                    // strokeWidth: 2, // вказує товщину CircularProgressIndicator
                    backgroundColor: Colors.grey,
                    valueColor: AlwaysStoppedAnimation(Colors.amber),
                  ),
                );
              }
              if (snapshot.connectionState == ConnectionState.done &&
                  snapshot.hasData) {
                return ListView.separated(
                  padding: const EdgeInsets.only(left: 40, top: 20),
                  itemCount: topics.length,
                  itemBuilder: (BuildContext context, int index) {
                    return Row(children: [
                      Container(
                          width: 250,
                          height: 50,
                          color: Colors.grey[400],
                          child: Center(
                            child: Text(topics[index].toString(),
                                style: const TextStyle(
                                    fontSize: 22, color: Colors.black)),
                          )),
                      const SizedBox(
                        width: 20,
                      ),
                      ElevatedButton(
                          style: style,
                          child: const Icon(
                            Icons.settings_applications_sharp,
                          ),
                          onPressed: () {
                            goTo();
                          }),
                    ]);
                  },
                  separatorBuilder: (BuildContext context, int index) =>
                      const Divider(
                    height: 20,
                    thickness: 0,
                    indent: 0,
                    endIndent: 1245,
                    color: Colors.black,
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
            }));

    // return const PortalMasterLayout(
    //   body: Text(
    //     "Ololo",
    //     style: TextStyle(
    //         fontSize: 16, color: Colors.red, fontWeight: FontWeight.w800),
    //   ),
    // );
  }
}

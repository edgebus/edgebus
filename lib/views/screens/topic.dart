import 'package:edgebus_console/api/api_client.dart';
import 'package:edgebus_console/api/api_client_mock.dart';
import 'package:edgebus_console/model/topic.dart';
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

  // Future<List<Topic>> getList() {
  //   return Future.delayed(
  //       const Duration(seconds: 3),
  //       () => this
  //           .widget
  //           .apiClient
  //           .listTopics(FExecutionContext.defaultExecutionContext));
  // }

  Widget build(BuildContext context) {
    // final String usersStr = topics.toString();
    // final lang = Lang.of(context);
    // final themeData = Theme.of(context);
    // final appColorScheme = themeData.extension<AppColorScheme>()!;
    const List<String> topics = <String>[
      "my-topic-1",
      "my-topic-2",
    ];

    return Scaffold(
        body: SizedBox(
            width: double.infinity,
            child: Center(
                child: FutureBuilder(
                    future: getList(),
                    // initialData: "Code sample",
                    builder: (BuildContext context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        if (snapshot.hasError) {
                          return Center(
                            child: Text(
                              'An ${snapshot.error} occurred',
                              style: const TextStyle(
                                  fontSize: 18, color: Colors.red),
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
                        return ListView.builder(
                            padding: const EdgeInsets.all(8),
                            itemCount: topics.length,
                            itemBuilder: (BuildContext context, int index) {
                              return Container(
                                  height: 50,
                                  color: Colors.amber,
                                  child: Center(
                                    child: Text(topics[index].toString(),
                                        style: const TextStyle(
                                            fontSize: 22, color: Colors.red)),
                                  ));
                            });
                      }
                      return const Center(
                        child: CircularProgressIndicator(
                          // strokeWidth: 2, // вказує товщину CircularProgressIndicator
                          backgroundColor: Colors.grey,
                          valueColor: AlwaysStoppedAnimation(Colors.green),
                        ),
                      );
                    }))));

    // return const PortalMasterLayout(
    //   body: Text(
    //     "Ololo",
    //     style: TextStyle(
    //         fontSize: 16, color: Colors.red, fontWeight: FontWeight.w800),
    //   ),
    // );
  }
}

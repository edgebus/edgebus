// import 'dart:js_interop';

import 'package:flutter/material.dart';
import 'package:edgebus_console/environment.dart';
import 'package:edgebus_console/root_app.dart';
import 'package:freemework/freemework.dart' show FException;

void main() async {
  final FException e = FException();

  WidgetsFlutterBinding.ensureInitialized();

  Environment.init(
    apiBaseUrl: 'https://example.com',
  );

  runApp(const RootApp());
}

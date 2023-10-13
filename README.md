# EdgeBus console

The EdgeBus console helps you deploy, scale, and diagnose production issues in a simple web-based interface.
Includes `Dockerfile` for easy containerization.

## Get Started

1. Rebase work branch and update local branches. You have to execute following sequence of commands:

    ```shell
    git fetch
    git checkout src-dart-console-11 
    cd src-dart-console
    ```

1. Install [Dart 3.0.6](https://dart.dev/get-dart) into `~/opt/dart/3.0.6-x64` and make symlink `~/opt/dart/current` -> `~/opt/dart/3.0.6-x64`
1. Get CLI tools `~/opt/dart/current/bin/pub global activate webdev`
1. Get the dependencies: `~/opt/dart/current/bin/pub get`
1. Get generate a release build: `flutter build web`
1. Launch the app: `flutter run --device-id chrome`
1. Navigate your browser to <http://127.0.0.1:8080/>

## Credentials

- Username: admin
- Password: admin

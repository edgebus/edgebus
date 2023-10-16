ARG EdgeBus=latest
ARG ALPINE_VERSION=3.18.4

ARG IMAGE_TAG_NGINX=1.19.8-alpine

# FROM mikefarah/yq AS yq

# FROM fischerscode/flutter:flutter-3.13-candidate.0 AS console-builder
# ARG BUILD_TAG_VERSION
# ARG BUILD_CONFIGURATION
# # USER root
# COPY --from=yq /usr/bin/yq /home/flutter/yq
# WORKDIR /home/flutter/work
# COPY pubspec.yaml pubspec.yaml
# RUN \
#     set -e; \
#     PROJ_VERSION="$(/home/flutter/yq -r '.version' pubspec.yaml)"; \
#     set +e; \
#     if [ -n "${BUILD_TAG_VERSION}" ]; then \
#       if [ "${BUILD_TAG_VERSION}" != "${PROJ_VERSION}" ]; then \
#         echo "Project version '${PROJ_VERSION}' is not same to tag version '${BUILD_TAG_VERSION}'. Cannot continue. Try to set correct project before tag creation." >&2; \
#         exit 1; \
#       fi; \
#     fi;
# RUN mkdir -p /home/flutter/stage/usr/local/edgebus/console
# RUN mkdir -p /home/flutter/stage/usr/local/bin/
# COPY lib /home/flutter/work/lib
# COPY web /home/flutter/work/web
# RUN flutter pub get
# RUN flutter build web lib/main.dart
# # RUN flutter pub run build_runner build --config "${BUILD_CONFIGURATION}" --release --output web:build
# # COPY docker/app.logo /home/flutter/stage/usr/local/edgebus/console/edgebus-service.logo
# # COPY docker/docker-entrypoint.sh /home/flutter/stage/usr/local/bin/docker-entrypoint-edgebus.sh

FROM fischerscode/flutter:flutter-3.13-candidate.0 AS console-builder
RUN mkdir -p /home/flutter/stage/usr/local/edgebus/console
RUN echo "<h1>HELLO, WORLD!!!</h1>" > /home/flutter/stage/usr/local/edgebus/console/index.html

# https://dev.zxteam.net/2022cexmirror/gitlab/cexpay.dashboard-wznk/-/tree/master/docker


# Merge both web application to be able to make final image with single layer
FROM nginx:${IMAGE_TAG_NGINX} AS compositor
COPY --from=console-builder /home/flutter/stage /home/flutter/stage
COPY docker/nginx-http.conf /home/flutter/stage/etc/nginx/nginx-http.conf
COPY docker/nginx-https.conf /home/flutter/stage/etc/nginx/nginx-https.conf
COPY docker/nginx-include.conf /home/flutter/stage/etc/nginx/nginx-include.conf
COPY docker/docker-entrypoint.sh /home/flutter/stage/usr/local/bin/docker-entrypoint.sh


FROM nginx:${IMAGE_TAG_NGINX}
COPY --from=compositor /home/flutter/stage /
EXPOSE 8080 8443
VOLUME /etc/edgebus/console/ssl
ENTRYPOINT [ "/usr/local/bin/docker-entrypoint.sh" ]
CMD []


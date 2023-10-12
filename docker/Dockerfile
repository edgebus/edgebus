ARG EdgeBus=latest
ARG ALPINE_VERSION=3.18.4

ARG IMAGE_TAG_NGINX=1.19.8-alpine

# FROM mikefarah/yq AS yq

# FROM dart:3.1.0-262.1.beta-sdk AS builder
# ARG BUILD_TAG_VERSION
# COPY --from=yq /usr/bin/yq /usr/bin/yq
# WORKDIR /build
# COPY pubspec.yaml pubspec.yaml
# RUN \
#     set -e; \
#     PROJ_VERSION="$(yq -r '.version' pubspec.yaml)"; \
#     set +e; \
#     if [ -n "${BUILD_TAG_VERSION}" ]; then \
#       if [ "${BUILD_TAG_VERSION}" != "${PROJ_VERSION}" ]; then \
#         echo "Project version '${PROJ_VERSION}' is not same to tag version '${BUILD_TAG_VERSION}'. Cannot continue. Try to set correct project before tag creation." >&2; \
#         exit 1; \
#       fi; \
#     fi;
# RUN mkdir -p /stage/usr/local/edgebus/
# RUN mkdir -p /stage/usr/local/bin/
# COPY bin/server.dart /build/bin/server.dart
# COPY lib /build/lib
# COPY pubspec.lock /build/pubspec.lock
# RUN dart pub get
# RUN dart compile exe --output /stage/usr/local/edgebus/edgebus-service bin/server.dart
# COPY docker/app.logo /stage/usr/local/edgebus/edgebus-service.logo
# COPY docker/docker-entrypoint.sh /stage/usr/local/bin/docker-entrypoint-edgebus.sh

FROM alpine AS console-builder
RUN mkdir -p /stage/usr/local/edgebus/console
RUN echo "<h1>HELLO, WORLD!!!</h1>" > /stage/usr/local/edgebus/console/index.html


# https://dev.zxteam.net/2022cexmirror/gitlab/cexpay.dashboard-wznk/-/tree/master/docker


# Merge both web application to be able to make final image with single layer
FROM nginx:${IMAGE_TAG_NGINX} AS compositor
COPY --from=console-builder /stage /stage
COPY docker/nginx-http.conf /stage/etc/nginx/nginx-http.conf
COPY docker/nginx-https.conf /stage/etc/nginx/nginx-https.conf
COPY docker/nginx-include.conf /stage/etc/nginx/nginx-include.conf
COPY docker/docker-entrypoint.sh /stage/usr/local/bin/docker-entrypoint.sh


FROM nginx:${IMAGE_TAG_NGINX}
COPY --from=compositor /stage /
EXPOSE 8080 8443
VOLUME /etc/edgebus/console/ssl
ENTRYPOINT [ "/usr/local/bin/docker-entrypoint.sh" ]
CMD []


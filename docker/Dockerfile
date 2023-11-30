ARG ALPINE_VERSION=3.18.4
ARG IMAGE_TAG_NGINX=1.19.8-alpine


FROM mikefarah/yq AS yq


FROM fischerscode/flutter:flutter-3.13-candidate.0 AS console-builder
ARG BUILD_TAG_VERSION
ARG BUILD_CONFIGURATION
COPY --from=yq /usr/bin/yq /home/flutter/yq
WORKDIR /home/flutter/work
COPY pubspec.yaml pubspec.yaml
RUN \
    set -e; \
    PROJ_VERSION="$(/home/flutter/yq -r '.version' pubspec.yaml)"; \
    set +e; \
    if [ -n "${BUILD_TAG_VERSION}" ]; then \
      if [ "${BUILD_TAG_VERSION}" != "${PROJ_VERSION}" ]; then \
        echo "Project version '${PROJ_VERSION}' is not same to tag version '${BUILD_TAG_VERSION}'. Cannot continue. Try to set correct project before tag creation." >&2; \
        exit 1; \
      fi; \
    fi;
COPY lib /home/flutter/work/lib
COPY web /home/flutter/work/web
RUN flutter pub get
RUN flutter build web lib/main.dart
RUN mkdir -p /home/flutter/stage/usr/local/edgebus
RUN mkdir -p /home/flutter/stage/usr/local/bin/
RUN mv build/web /home/flutter/stage/usr/local/edgebus/console


# Merge both web application to be able to make final image with single layer
FROM nginx:${IMAGE_TAG_NGINX} AS compositor
COPY --from=console-builder /home/flutter/stage /stage
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

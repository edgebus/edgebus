ARG IMAGE_TAG_NODEJS=16-alpine
ARG BUILD_CONFIGURATION=release

#
#   ____    _   _   ___   _       ____      ____    _   _      _      ____    _____
#  | __ )  | | | | |_ _| | |     |  _ \    |  _ \  | | | |    / \    / ___|  | ____|
#  |  _ \  | | | |  | |  | |     | | | |   | |_) | | |_| |   / _ \   \___ \  |  _|
#  | |_) | | |_| |  | |  | |___  | |_| |   |  __/  |  _  |  / ___ \   ___) | | |___
#  |____/   \___/  |___| |_____| |____/    |_|     |_| |_| /_/   \_\ |____/  |_____|
#

FROM node:${IMAGE_TAG_NODEJS} AS builder1_base
# Like snapshot/release
ARG BUILD_CONFIGURATION
# Like dev/master/1.0.0
ARG BUILD_COMMIT_REF
ARG BUILD_COMMIT_TIMESTAMP
ARG BUILD_PIPELINE_URL
ARG BUILD_PROJECT_URL
ARG BUILD_RC_VERSION
ARG BUILD_TAG_VERSION
ARG BUILD_VERSION_APPENDER
RUN apk add --no-cache jq moreutils
WORKDIR /build
COPY bin ./bin
COPY src ./src
COPY \
  .npmrc \
  package.json \
  package-lock.json \
  tsconfig.json \
  tsconfig-application.json \
  ./
RUN \
  set -e; \
  PROJ_VERSION="$(jq -r '.version' package.json)"; \
  set +e; \
  if [ -n "${BUILD_TAG_VERSION}" ]; then \
    if [ "${BUILD_TAG_VERSION}" != "${PROJ_VERSION}" ]; then \
      echo "Project version '${PROJ_VERSION}' is not same to tag version '${BUILD_TAG_VERSION}'. Cannot continue. Try to set correct project before tag creation." >&2; \
      exit 1; \
    fi; \
  fi; \
  if [ -n "${BUILD_RC_VERSION}" ]; then \
    jq -M ".build.release_candidate=\"${BUILD_RC_VERSION}\"" < package.json | sponge package.json; \
  fi; \
  if [ -n "${BUILD_VERSION_APPENDER}" ]; then \
	jq -M ".build.version=\"${PROJ_VERSION}${BUILD_VERSION_APPENDER}\"" < package.json | sponge package.json; \
  fi;
RUN jq -M ".build.commit_reference=\"${BUILD_COMMIT_REF}\"" < package.json | sponge package.json
RUN jq -M ".build.commit_timestamp=\"${BUILD_COMMIT_TIMESTAMP}\"" < package.json | sponge package.json
RUN jq -M ".build.project_url=\"${BUILD_PROJECT_URL}\"" < package.json | sponge package.json
RUN jq -M ".build.pipeline_url=\"${BUILD_PIPELINE_URL}\"" < package.json | sponge package.json
RUN jq -M ".build.configuration=\"${BUILD_CONFIGURATION}\"" < package.json | sponge package.json
RUN npm install --silent --no-progress

FROM builder1_base AS builder1_snapshot
COPY src-devel ./src-devel

FROM builder1_base AS builder1_release
# Nothing special for 'release' at composite phase

FROM builder1_${BUILD_CONFIGURATION} AS builder1
RUN npm run build:application
RUN \
  mkdir -p /stage/usr/local && \
  mv .dist /stage/usr/local/edgebus && \
  mv package-lock.json /stage/usr/local/edgebus
WORKDIR /stage/usr/local/edgebus
RUN rm -rf /build
RUN npm install --omit=dev --silent --no-progress
RUN rm package-lock.json


#
#   ____    ___    __  __   ____     ___    ____    ___   _____   _____     ____    _   _      _      ____    _____
#  / ___|  / _ \  |  \/  | |  _ \   / _ \  / ___|  |_ _| |_   _| | ____|   |  _ \  | | | |    / \    / ___|  | ____|
# | |     | | | | | |\/| | | |_) | | | | | \___ \   | |    | |   |  _|     | |_) | | |_| |   / _ \   \___ \  |  _|
# | |___  | |_| | | |  | | |  __/  | |_| |  ___) |  | |    | |   | |___    |  __/  |  _  |  / ___ \   ___) | | |___
#  \____|  \___/  |_|  |_| |_|      \___/  |____/  |___|   |_|   |_____|   |_|     |_| |_| /_/   \_\ |____/  |_____|
#

# Compositor merges all artifacts between builds
FROM node:${IMAGE_TAG_NODEJS} AS compositor_base
COPY docker/docker-entrypoint-edgebus.sh /stage/usr/local/bin/docker-entrypoint-edgebus.sh
COPY edgebus-runtime.toml /stage/etc/edgebus/

FROM compositor_base AS compositor_snapshot
# Nothing special for 'snapshot' at composite phase

FROM compositor_base AS compositor_release
# Nothing special for 'release' at composite phase

# Merge all stuff together to be able to make final image with single layer
FROM compositor_${BUILD_CONFIGURATION} AS compositor
COPY --from=builder1 /stage /stage
#COPY --from=builder2 /stage /stage
#COPY --from=builder3 /stage /stage


#
#   ___   __  __      _       ____   _____     ____    _   _      _      ____    _____
#  |_ _| |  \/  |    / \     / ___| | ____|   |  _ \  | | | |    / \    / ___|  | ____|
#   | |  | |\/| |   / _ \   | |  _  |  _|     | |_) | | |_| |   / _ \   \___ \  |  _|
#   | |  | |  | |  / ___ \  | |_| | | |___    |  __/  |  _  |  / ___ \   ___) | | |___
#  |___| |_|  |_| /_/   \_\  \____| |_____|   |_|     |_| |_| /_/   \_\ |____/  |_____|
#

# Base imager
FROM node:${IMAGE_TAG_NODEJS} AS imager_base
ONBUILD ENV LOG_LEVEL=info

# Imager for 'snapshot' build includes snapshot related stuff into final image
FROM imager_base AS imager_snapshot
ONBUILD RUN apk add --no-cache curl jq python3
ONBUILD ENV DO_INIT_SLEEP=4

# Imager for 'release' build includes release related stuff into final image
FROM imager_base AS imager_release
ONBUILD RUN apk add --no-cache jq python3
ONBUILD ENV DO_INIT_SLEEP=

# Final image
FROM imager_${BUILD_CONFIGURATION}
COPY --from=compositor /stage/ /
# Update OpenSSL CA certificates bundle to register runtime certificates
# RUN update-ca-certificates
EXPOSE 8080 8443
ENTRYPOINT [ "/usr/local/bin/docker-entrypoint-edgebus.sh" ]
CMD ["--config-toml-file=/etc/edgebus/edgebus-runtime.toml","--config-env"]

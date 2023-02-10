ARG IMAGE=node:11-alpine

FROM ${IMAGE} AS Builder
WORKDIR /build
USER root
COPY .dist/ usr/local/org.zxteam.notifier/
COPY log4js.json etc/org.zxteam.notifier/log4js.json
RUN cd usr/local/org.zxteam.notifier/ && npm install --quiet --production
RUN rm usr/local/org.zxteam.notifier/.npmrc
RUN mkdir -p etc/org.zxteam.notifier/ && \
	mv usr/local/org.zxteam.notifier/edgebus.config etc/org.zxteam.notifier/ && \
	chmod ug+r -R etc/org.zxteam.notifier && \
	chmod g-w -R etc/org.zxteam.notifier && \
	chmod o-rwx -R etc/org.zxteam.notifier && \
	chmod a+r -R usr/local/org.zxteam.notifier && \
	chmod og-w -R usr/local/org.zxteam.notifier
COPY docker/notifier-entrypoint.sh ./

FROM ${IMAGE}
USER node
COPY --from=Builder --chown=root:node /build/ /
EXPOSE 8080
ENV LOG4JS_CONFIG=/etc/org.zxteam.notifier/log4js.json
ENTRYPOINT ["/notifier-entrypoint.sh"]
CMD ["notifier"]

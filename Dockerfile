ARG IMAGE=node:11-alpine

FROM ${IMAGE} AS Builder
WORKDIR /build
COPY .dist/ usr/local/org.zxteam.notifier/
COPY .npmrc usr/local/org.zxteam.notifier/
COPY service.config etc/org.zxteam.notifier/service.config
COPY log4js.json etc/org.zxteam.notifier/log4js.json
RUN cd usr/local/org.zxteam.notifier/ && npm install --quiet --production
RUN rm usr/local/org.zxteam.notifier/.npmrc && \
	chown root:root -R etc/org.zxteam.notifier && \
	chmod a+r -R etc/org.zxteam.notifier && \
	chmod og-w -R etc/org.zxteam.notifier && \
	chown root:root -R usr/local/org.zxteam.notifier && \
	chmod a+r -R usr/local/org.zxteam.notifier && \
	chmod og-w -R usr/local/org.zxteam.notifier 

FROM ${IMAGE}
COPY --from=Builder /build/ /
USER node
EXPOSE 8080
ENV LOG4JS_CONFIG=/etc/org.zxteam.notifier/log4js.json
CMD ["node", "/usr/local/org.zxteam.notifier/lib/app.js", "--config=/etc/org.zxteam.notifier/service.config"]

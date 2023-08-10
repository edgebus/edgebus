import { FException, FExceptionInvalidOperation, FExecutionContext, FLoggerLabelsExecutionContext } from "@freemework/common";

import * as _ from "lodash";

import { Settings } from "../settings";
import { ManagementApi } from "../api/management_api";
import {
	EgressIdentifier, Egress,
	IngressIdentifier, Ingress,
	LabelHandlerIdentifier,
	TopicIdentifier, Topic, LabelIdentifier
} from "../model";


export interface SetupService {
	setup(executionContext: FExecutionContext, managementApi: ManagementApi, setupSettings: Settings.Setup): Promise<void>;
}

export class SetupServiceImpl implements SetupService {
	public async setup(executionContext: FExecutionContext, managementApi: ManagementApi, setupSettings: Settings.Setup): Promise<void> {

		// Setup topics
		for (const setupTopic of setupSettings.topics) {
			const topicId: TopicIdentifier = TopicIdentifier.parse(setupTopic.topicId);
			const topic: Topic | null = await managementApi.findTopic(executionContext, topicId);
			if (topic !== null) {
				// compare
				if (topic.topicName !== setupTopic.name) {
					throw new SetupServiceException(`Unable to setup topics. A topic '${topicId}' already presented with different name '${topic.topicName}'. Setup process expected name '${setupTopic.name}'.`);
				}
				if (topic.topicMediaType !== setupTopic.mediaType) {
					throw new SetupServiceException(`Unable to setup topics. A topic '${topicId}' already presented with different media type '${topic.topicMediaType}'. Setup process expected media type '${setupTopic.mediaType}'.`);
				}
				if (topic.topicDescription !== setupTopic.description) {
					throw new SetupServiceException(`Unable to setup topics. A topic '${topicId}' already presented with different description '${topic.topicDescription}'. Setup process expected description '${setupTopic.description}'.`);
				}
				if (topic.topicDomain !== null) {
					throw new SetupServiceException(`Unable to setup topics. A topic '${topicId}' already presented with domain '${topic.topicDomain}'. Setup process expected NO domain.`);
				}
			} else {
				await managementApi.createTopic(executionContext, {
					topicId,
					topicName: setupTopic.name,
					topicDescription: setupTopic.description,
					topicDomain: null,
					topicMediaType: setupTopic.mediaType,
				});
			}

			for (const setupLabelHandler of setupTopic.labelHandlers) {
				const labelHandlerId: LabelHandlerIdentifier = LabelHandlerIdentifier.parse(setupLabelHandler.labelHandlerId);
				const labelHandler = await managementApi.findLabelHandler(executionContext, labelHandlerId);

				if (labelHandler !== null) {
					if (labelHandler.externalProcessPath !== setupLabelHandler.path) {
						throw new SetupServiceException(`Unable to setup label handler. A label handler '${labelHandlerId}' already presented with different path '${labelHandler.externalProcessPath}'. Setup process expected name '${setupLabelHandler.path}'.`);
					}
					if (labelHandler.topicId.value !== topicId.value) {
						throw new SetupServiceException(`Unable to setup label handler. A label handler '${labelHandlerId}' already presented with different topicId '${labelHandler.topicId}'. Setup process expected topicId '${topicId}'.`);
					}
					if (labelHandler.labelHandlerKind !== setupLabelHandler.kind) {
						throw new SetupServiceException(`Unable to setup label. A labelHandler '${labelHandlerId}' already presented with different kind '${labelHandler.labelHandlerKind}'. Setup process expected kind '${setupLabelHandler.kind}'.`);
					}
				} else {
					await managementApi.createLabelHandler(executionContext, {
						labelHandlerId,
						topicId,
						labelHandlerKind: setupLabelHandler.kind,
						externalProcessPath: setupLabelHandler.path
					})
				}
			}

		}

		// Setup ingresses
		for (const setupIngress of setupSettings.ingresses) {
			const ingressId: IngressIdentifier = IngressIdentifier.parse(setupIngress.ingressId);
			const ingressTopicId: TopicIdentifier = TopicIdentifier.parse(setupIngress.topicId);

			const ingress: Ingress | null = await managementApi.findIngress(executionContext, ingressId);
			if (ingress !== null) {
				// compare
				if (ingress.ingressTopicId.value !== setupIngress.topicId) {
					throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different target topic '${ingress.ingressTopicId}'. Setup process expected target topic '${setupIngress.topicId}'.`);
				}
				switch (setupIngress.kind) {
					case Ingress.Kind.HttpHost:
						if (ingress.ingressKind !== Ingress.Kind.HttpHost) {
							throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different kind '${ingress.ingressKind}'. Setup process expected type '${Ingress.Kind.HttpHost}'.`);
						}
						if (ingress.ingressHttpHostPath !== setupIngress.path) {
							throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different path '${ingress.ingressHttpHostPath}'. Setup process expected path '${setupIngress.path}'.`);
						}
						if (!_.isEqual(ingress.ingressHttpHostResponseBody, setupIngress.responseBody)) {
							throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different response body.`);
						}
						if (!_.isEqual(ingress.ingressHttpHostResponseHeaders, setupIngress.responseHeaders)) {
							throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different response headers.`);
						}
						if (ingress.ingressHttpHostResponseStatusCode !== setupIngress.responseStatusCode) {
							throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different response status code '${ingress.ingressHttpHostResponseStatusCode}'. Setup process expected response status code '${setupIngress.responseStatusCode}'.`);
						}
						if (ingress.ingressHttpHostResponseStatusMessage !== setupIngress.responseStatusMessage) {
							throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different response status message '${ingress.ingressHttpHostResponseStatusMessage}'. Setup process expected response status message '${setupIngress.responseStatusMessage}'.`);
						}
						break;
					case Ingress.Kind.WebSocketClient:
						if (ingress.ingressKind !== Ingress.Kind.WebSocketClient) {
							throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different kind '${ingress.ingressKind}'. Setup process expected type '${Ingress.Kind.WebSocketClient}'.`);
						}
						if (ingress.ingressWebSocketClientUrl.toString() !== setupIngress.url.toString()) {
							throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different path '${ingress.ingressWebSocketClientUrl}'. Setup process expected path '${setupIngress.url}'.`);
						}
						break;
					case Ingress.Kind.WebSocketHost:
						throw new FExceptionInvalidOperation("Not implemented yet");
					default:
						throw new FExceptionInvalidOperation("Not implemented yet");
				}
			} else {
				// create
				let ingressData: Ingress.Data;
				switch (setupIngress.kind) {
					case Ingress.Kind.HttpHost:
						ingressData = {
							ingressKind: setupIngress.kind,
							ingressTopicId: ingressTopicId,
							// ingressHttpHostClientSslCommonName: null,
							// ingressHttpHostClientSslTrustedCaCertificates: null,
							// ingressHttpHostMandatoryHeaders: null,
							ingressHttpHostPath: setupIngress.path,
							ingressHttpHostResponseBody: setupIngress.responseBody,
							ingressHttpHostResponseHeaders: setupIngress.responseHeaders,
							ingressHttpHostResponseStatusCode: setupIngress.responseStatusCode,
							ingressHttpHostResponseStatusMessage: setupIngress.responseStatusMessage,
						};
						break;
					case Ingress.Kind.WebSocketClient:
						ingressData = {
							ingressKind: setupIngress.kind,
							ingressTopicId: ingressTopicId,
							ingressWebSocketClientUrl: setupIngress.url
						};
						break;
					default:
						throw new FExceptionInvalidOperation("Not implemented yet");
				}
				await managementApi.createIngress(executionContext, { ...ingressData, ingressId });
			}
		}

		// Setup egresses
		for (const setupEgress of setupSettings.egresses) {
			const egressId: EgressIdentifier = EgressIdentifier.parse(setupEgress.egressId);
			const egressTopicIds: Array<TopicIdentifier> = setupEgress.sourceTopicIds.map(TopicIdentifier.parse);
			const filterLabelPolicy: Egress.FilterLabelPolicy = setupEgress.filterLabelPolicy;
			const labelIds: Array<LabelIdentifier> = [];

			const setupEgressExecutionContext: FExecutionContext = new FLoggerLabelsExecutionContext(executionContext, {
				egressId: egressId.value,
			});

			for (const label of setupEgress.filterLabels) {
				labelIds.push((await managementApi.getOrCreateLabel(setupEgressExecutionContext, label)).labelId);
			}

			const egress: Egress | null = await managementApi.findEgress(setupEgressExecutionContext, egressId);
			if (egress !== null) {
				// compare
			} else {
				//
				let egressData: Egress.Data;
				switch (setupEgress.kind) {
					case Egress.Kind.WebSocketHost:
						egressData = {
							egressKind: setupEgress.kind,
							egressTopicIds: egressTopicIds,
							egressFilterLabelPolicy: filterLabelPolicy,
							egressFilterLabelIds: labelIds
						};
						break;
					case Egress.Kind.Webhook:
						egressData = {
							egressKind: setupEgress.kind,
							egressTopicIds: egressTopicIds,
							egressHttpMethod: setupEgress.method,
							egressHttpUrl: setupEgress.url,
							egressFilterLabelPolicy: filterLabelPolicy,
							egressFilterLabelIds: labelIds,
						}
						break;
					default:
						throw new FExceptionInvalidOperation("Not implemented yet");
				}
				await managementApi.createEgress(setupEgressExecutionContext, { ...egressData, egressId });
			}
		}
	}
}

export class SetupServiceException extends FException {
}

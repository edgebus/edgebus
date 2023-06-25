import { FException, FExceptionInvalidOperation, FExecutionContext } from "@freemework/common";

import * as _ from "lodash";

import { DatabaseFactory } from "../data/database_factory";
import { Settings } from "../settings";
import { ManagementApi } from "../api/management_api";
import { Topic } from "../model/topic";
import { EgressApiIdentifier, IngressApiIdentifier, LabelHandlerApiIdentifier, TopicApiIdentifier } from "../misc/api-identifier";
import { Ingress } from "../model/ingress";
import { Uint8ArraysEqual } from "../utils/equals";
import { Egress } from "../model/egress";


export interface SetupService {
	setup(executionContext: FExecutionContext, managementApi: ManagementApi, setupSettings: Settings.Setup): Promise<void>;
}

export class SetupServiceImpl implements SetupService {
	public async setup(executionContext: FExecutionContext, managementApi: ManagementApi, setupSettings: Settings.Setup): Promise<void> {

		// Setup topics
		for (const setupTopic of setupSettings.topics) {
			const topicId: TopicApiIdentifier = TopicApiIdentifier.parse(setupTopic.topicId);
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
				const labelHandlerId: LabelHandlerApiIdentifier = LabelHandlerApiIdentifier.parse(setupLabelHandler.labelHandlerId);
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
			const ingressId: IngressApiIdentifier = IngressApiIdentifier.parse(setupIngress.ingressId);
			const ingressTopicId: TopicApiIdentifier = TopicApiIdentifier.parse(setupIngress.topicId);

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
						throw new FExceptionInvalidOperation("Not implemented yet");
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
					default:
						throw new FExceptionInvalidOperation("Not implemented yet");
				}
				await managementApi.createIngress(executionContext, { ...ingressData, ingressId });
			}
		}

		// Setup egresses
		for (const setupEgress of setupSettings.egresses) {
			const egressId: EgressApiIdentifier = EgressApiIdentifier.parse(setupEgress.egressId);
			const egressTopicIds: Array<TopicApiIdentifier> = setupEgress.sourceTopicIds.map(TopicApiIdentifier.parse);

			const egress: Egress | null = await managementApi.findEgress(executionContext, egressId);
			if (egress !== null) {
				// compare
			} else {
				//
				let egressData: Egress.Data;
				switch (setupEgress.kind) {
					case Egress.Kind.WebSocketHost:
						egressData = {
							egressKind: setupEgress.kind,
							egressTopicIds: egressTopicIds
						};
						break;
					case Egress.Kind.Webhook:
						egressData = {
							egressKind: setupEgress.kind,
							egressTopicIds: egressTopicIds,
							egressHttpMethod: setupEgress.method,
							egressHttpUrl: setupEgress.url
						}
						break;
					default:
						throw new FExceptionInvalidOperation("Not implemented yet");
				}
				await managementApi.createEgress(executionContext, { ...egressData, egressId });
			}
		}
	}
}

export class SetupServiceException extends FException {
}

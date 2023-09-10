import { FException, FExceptionInvalidOperation, FExecutionContext, FLogger, FLoggerLabelsExecutionContext } from "@freemework/common";

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
	setup(executionContext: FExecutionContext, managementApi: ManagementApi, setupSettings: Settings.Setup): Promise<boolean>;
}

export class SetupServiceImpl implements SetupService {
	private readonly _log: FLogger;

	public constructor() {
		this._log = FLogger.create(this.constructor.name);
	}

	public async setup(executionContext: FExecutionContext, managementApi: ManagementApi, setupSettings: Settings.Setup): Promise<boolean> {
		this._log.info(executionContext, "Running setup process...");

		let wasChanged: boolean = false;

		// Setup topics
		for (const setupTopic of setupSettings.topics) {
			const setupTopicExecutionContext: FExecutionContext = new FLoggerLabelsExecutionContext(executionContext, {
				setupTopicId: setupTopic.topicId
			});
			const topicId: TopicIdentifier = TopicIdentifier.parse(setupTopic.topicId);
			const topic: Topic | null = await managementApi.findTopic(setupTopicExecutionContext, topicId);
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
				this._log.info(setupTopicExecutionContext, () => `Skip topic '${setupTopic.name}' creation due it already exist`);
			} else {
				await managementApi.createTopic(setupTopicExecutionContext, {
					topicId,
					topicName: setupTopic.name,
					topicDescription: setupTopic.description,
					topicDomain: null,
					topicMediaType: setupTopic.mediaType,
				});
				this._log.info(setupTopicExecutionContext, () => `A new topic '${setupTopic.name}' was created`);
				wasChanged = true;
			}

			for (const setupLabelHandler of setupTopic.labelHandlers) {
				const setupLabelHandlerExecutionContext: FExecutionContext = new FLoggerLabelsExecutionContext(setupTopicExecutionContext, {
					setupLabelHandlerId: setupLabelHandler.labelHandlerId
				});

				const labelHandlerId: LabelHandlerIdentifier = LabelHandlerIdentifier.parse(setupLabelHandler.labelHandlerId);
				const labelHandler = await managementApi.findLabelHandler(setupLabelHandlerExecutionContext, labelHandlerId);

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
					this._log.info(setupTopicExecutionContext, () => `A new labels handler '${setupLabelHandler.kind}' was created`);
				} else {
					await managementApi.createLabelHandler(setupLabelHandlerExecutionContext, {
						labelHandlerId,
						topicId,
						labelHandlerKind: setupLabelHandler.kind,
						externalProcessPath: setupLabelHandler.path
					});
					this._log.info(setupTopicExecutionContext, () => `A new labels handler '${setupLabelHandler.kind}' was created`);
					wasChanged = true;
				}
			}
		}

		// Setup ingresses
		for (const setupIngress of setupSettings.ingresses) {
			const setupIngressExecutionContext: FExecutionContext = new FLoggerLabelsExecutionContext(executionContext, {
				setupTopicId: setupIngress.topicId,
				setupIngressId: setupIngress.ingressId
			});

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
						if (ingress.ingressHttpHostResponseKind !== setupIngress.httpResponseKind) {
							throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different httpResponseKind '${ingress.ingressHttpHostResponseKind}'. Setup process expected path '${setupIngress.httpResponseKind}'.`);
						}
						
						switch (setupIngress.httpResponseKind) {
							case Ingress.HttpResponseKind.DYNAMIC: {
								if (ingress.ingressHttpHostResponseKind !== Ingress.HttpResponseKind.DYNAMIC) {
									throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different kind '${ingress.ingressKind}'. Setup process expected type '${Ingress.Kind.HttpHost}'.`);
								}
								if (!_.isEqual(ingress.ingressHttpHostResponseDynamicHandlerKind, setupIngress.responseHandlerKind)) {
									throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different response handler kind '${ingress.ingressHttpHostResponseDynamicHandlerKind}'. Setup process expected type '${setupIngress.responseHandlerKind}'.`);
								}
								if (!_.isEqual(ingress.ingressHttpHostResponseDynamicHandlerExternalScriptPath, setupIngress.responseHandlerPath)) {
									throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different response handler path '${ingress.ingressHttpHostResponseDynamicHandlerExternalScriptPath}'. Setup process expected type '${setupIngress.responseHandlerPath}'.`);
								}
								break;
							}
							case Ingress.HttpResponseKind.STATIC: {
								if (ingress.ingressHttpHostResponseKind !== Ingress.HttpResponseKind.STATIC) {
									throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different kind '${ingress.ingressKind}'. Setup process expected type '${Ingress.Kind.HttpHost}'.`);
								}
								if (!_.isEqual(ingress.ingressHttpHostResponseStaticBody, setupIngress.responseBody)) {
									throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different response body.`);
								}
								if (!_.isEqual(ingress.ingressHttpHostResponseStaticHeaders, setupIngress.responseHeaders)) {
									throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different response headers.`);
								}
								if (ingress.ingressHttpHostResponseStaticStatusCode !== setupIngress.responseStatusCode) {
									throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different response status code '${ingress.ingressHttpHostResponseStaticStatusCode}'. Setup process expected response status code '${setupIngress.responseStatusCode}'.`);
								}
								if (ingress.ingressHttpHostResponseStaticStatusMessage !== setupIngress.responseStatusMessage) {
									throw new SetupServiceException(`Unable to setup ingresses. A ingress '${ingressId}' already presented with different response status message '${ingress.ingressHttpHostResponseStaticStatusMessage}'. Setup process expected response status message '${setupIngress.responseStatusMessage}'.`);
								}
								break;
							}
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
				this._log.info(setupIngressExecutionContext, () => `Skip ingress '${setupIngress.kind}' creation due it already exist`);
			} else {
				// create
				let ingressData: Ingress.Data;
				switch (setupIngress.kind) {
					case Ingress.Kind.HttpHost:
						switch (setupIngress.httpResponseKind) {
							case Ingress.HttpResponseKind.DYNAMIC: {
								ingressData = {
									ingressKind: setupIngress.kind,
									ingressTopicId: ingressTopicId,
									ingressHttpHostPath: setupIngress.path,
									ingressHttpHostResponseDynamicHandlerKind: setupIngress.responseHandlerKind,
									ingressHttpHostResponseDynamicHandlerExternalScriptPath: setupIngress.responseHandlerPath,
									ingressHttpHostResponseKind: Ingress.HttpResponseKind.DYNAMIC
								};
								break;
							}
							case Ingress.HttpResponseKind.STATIC: {
								ingressData = {
									ingressKind: setupIngress.kind,
									ingressTopicId: ingressTopicId,
									// ingressHttpHostClientSslCommonName: null,
									// ingressHttpHostClientSslTrustedCaCertificates: null,
									// ingressHttpHostMandatoryHeaders: null,
									ingressHttpHostPath: setupIngress.path,
									ingressHttpHostResponseStaticBody: setupIngress.responseBody,
									ingressHttpHostResponseStaticHeaders: setupIngress.responseHeaders,
									ingressHttpHostResponseStaticStatusCode: setupIngress.responseStatusCode,
									ingressHttpHostResponseStaticStatusMessage: setupIngress.responseStatusMessage,
									ingressHttpHostResponseKind: Ingress.HttpResponseKind.STATIC
								};
								break;
							}
						}
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
				this._log.info(setupIngressExecutionContext, () => `A new ingress '${setupIngress.kind}' was created`);
				wasChanged = true;
			}
		}

		// Setup egresses
		for (const setupEgress of setupSettings.egresses) {
			const egressId: EgressIdentifier = EgressIdentifier.parse(setupEgress.egressId);
			const egressTopicIds: Array<TopicIdentifier> = setupEgress.sourceTopicIds.map(TopicIdentifier.parse);
			const filterLabelPolicy: Egress.FilterLabelPolicy = setupEgress.filterLabelPolicy;

			const setupEgressExecutionContext: FExecutionContext = new FLoggerLabelsExecutionContext(executionContext, {
				egressId: egressId.value,
			});

			const egress: Egress | null = await managementApi.findEgress(setupEgressExecutionContext, egressId);
			if (egress !== null) {
				// compare
				this._log.info(setupEgressExecutionContext, () => `Skip egress '${setupEgress.kind}' creation due it already exist`);
			} else {
				const labelIds: Array<LabelIdentifier> = [];
				for (const label of setupEgress.filterLabels) {
					labelIds.push((await managementApi.getOrCreateLabel(setupEgressExecutionContext, label)).labelId);
				}

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
				this._log.info(setupEgressExecutionContext, () => `A new egress '${setupEgress.kind}' was created`);
				wasChanged = true;
			}
		}
		return wasChanged;
	}
}

export class SetupServiceException extends FException {
}

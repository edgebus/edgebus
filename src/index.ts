import { FDisposable, FExecutionContext, FLoggerLabelsExecutionContext, FInitable, FLogger, FExceptionArgument } from "@freemework/common";
import { FLauncherRuntime } from "@freemework/hosting";

import * as _ from "lodash";

// Providers
import { SettingsProvider, SettingsProviderImpl } from "./provider/settings_provider";
import { StorageProvider } from "./provider/storage_provider";
import { EndpointsProvider } from "./provider/endpoints_provider";
import { HostingProvider } from "./provider/hosting_provider";
import { MessageBusProvider } from "./provider/message_bus_provider";
import { HttpHostPublisher } from "./publisher/http_host_publisher";
import { WebSocketHostSubscriber } from "./subscriber/websocket_host_subscriber";
import { MessageBus } from "./messaging/message_bus";
import { Container } from "typescript-ioc";
import { Settings } from "./settings";
import { HttpClientSubscriber } from "./subscriber/http_client_subscriber";

// Re-export stuff for embedded user's
export * from "./api/errors";
export { ManagementApi } from "./api/management_api";
export { PublisherApi } from "./api/publisher_api";
export { SubscriberApi } from "./api/subscriber_api";
export { ApiProvider } from "./provider/api_provider";
export { Settings } from "./settings";
// export { ConfigurationProvider } from "./provider/ConfigurationProvider";
//export { EndpointsProvider } from "./provider/EndpointsProvider";
export { HostingProvider } from "./provider/hosting_provider";
//export { MessageBusProvider } from "./provider/MessageBusProvider";
//export { StorageProvider } from "./provider/StorageProvider";

export * from "./misc";


const { name: serviceName, version: serviceVersion } = require("../package.json");

export default async function (executionContext: FExecutionContext, settings: Settings): Promise<FLauncherRuntime> {
	executionContext = new FLoggerLabelsExecutionContext(executionContext, { serviceName, serviceVersion });

	const log: FLogger = FLogger.create("EdgeBus");

	{
		log.info(executionContext, "Initializing ConfigurationProvider...");
		// const dbEncriptionKey = await passwordDerivation(configuration.dbEncryptionPassword);
		const ownProvider: SettingsProvider = new SettingsProviderImpl(settings);
		Container.bind(SettingsProvider).provider({ get() { return ownProvider; } });
	}


	log.info(executionContext, "Initializing DI runtime...");
	await FInitable.initAll(executionContext,
		Container.get(StorageProvider),
		Container.get(MessageBusProvider),
		Container.get(EndpointsProvider),
		Container.get(HostingProvider)
	);



	/* ---------HARDCODE--------------- */
	const itemsToDispose: Array<FDisposable> = [];
	try {
		const hardcodedPublisherConfigurations: Array<{
			readonly topicName: string;
			readonly topicDescription: string;
			readonly publisherId: string;
			readonly publisherPath: string;
		}> = [
				// {
				// 	topicName: "pss-provider-wtf2",
				// 	topicDescription: "PSS Provider WTF2 callbacks",
				// 	publisherId: "publisher.http.9028c574-98b6-4198-8fc7-1355e9ac622e",
				// 	publisherPath: "/v2/callback/cryptoproviders/pss-provider-wtf2"
				// },
				// {
				// 	topicName: "wtf2",
				// 	topicDescription: "WTF2 callbacks",
				// 	publisherId: "publisher.http.afb0ff9b-217d-4a5c-8b33-d76291bb7d81",
				// 	publisherPath: "/v2/callback/cryptoproviders/wtf2"
				// }
			];
		const hardcodedSubscriberConfigurations: Array<{
			readonly topicNames: ReadonlyArray<string>;
			readonly subscriberIds: ReadonlyArray<string>;
		}> = [
				// {
				// 	topicNames: ["pss-provider-wtf2", "wtf2"],
				// 	subscriberIds: [
				// 		"subscriber.websockethost.devel",
				// 		"subscriber.websockethost.evolution",
				// 		"subscriber.websockethost.presentation",
				// 		"subscriber.websockethost.serg4683-a00d-4269-b116-6959fb9ac889",
				// 		"subscriber.websockethost.maks4683-a00d-4269-b116-6959fb9ac889"
				// 	]
				// },
				// {
				// 	topicNames: ["pss-provider-wtf2", "wtf2"],
				// 	subscriberIds: [
				// 		"subscriber.httpclient.POST.http://localhost:8020",
				// 	]
				// }
			];

		const { setup } = settings;
		if (setup !== null) {
			const { publishers, subscribers, topics } = setup;

			const topicsByIdMap = new Map<string, Settings.Setup.Topic>();
			for (const topic of topics) {
				topicsByIdMap.set(topic.topicId, topic);
			}

			for (const publisher of publishers) {
				hardcodedPublisherConfigurations.push({
					topicName: topicsByIdMap.get(publisher.targetTopicId)!.name,
					topicDescription: topicsByIdMap.get(publisher.targetTopicId)!.description,
					publisherId: publisher.publisherId,
					publisherPath: publisher.path
				});
			}

			for (const subscriber of subscribers) {
				if (subscriber.type === Settings.Setup.Subscriber.Type.HTTP_CLIENT) {
					hardcodedSubscriberConfigurations.push({
						topicNames: subscriber.sourceTopicIds.map(s => topicsByIdMap.get(s)!.name),
						subscriberIds: [`subscriber.http_client.${subscriber.httpMethod}.${subscriber.httpUrl}`]
					});
				} else if (subscriber.type === Settings.Setup.Subscriber.Type.WEBSOCKET_HOST) {
					hardcodedSubscriberConfigurations.push({
						topicNames: subscriber.sourceTopicIds.map(s => topicsByIdMap.get(s)!.name),
						subscriberIds: [`subscriber.websocket_host.${subscriber.subscriberId}`]
					});
				}
			}
		}

		const endpointsProvider: EndpointsProvider = Container.get(EndpointsProvider);
		const messageBusProvider: MessageBusProvider = Container.get(MessageBusProvider);
		const storageProvider: StorageProvider = Container.get(StorageProvider);

		// Setup HTTP publisher
		for (const hardcodedPublisherConfiguration of hardcodedPublisherConfigurations) {
			const httpPublisherInstance: HttpHostPublisher = new HttpHostPublisher(
				storageProvider.persistentStorage,
				{
					topicName: hardcodedPublisherConfiguration.topicName,
					topicDomain: null,
					topicDescription: hardcodedPublisherConfiguration.topicDescription,
					topicMediaType: "application/json"
				},
				hardcodedPublisherConfiguration.publisherId,
				messageBusProvider,
				{
					transformers: [],
					bindPath: hardcodedPublisherConfiguration.publisherPath
					//successResponseGenerator: hardcodedPublisherConfiguration.publisherSuccessResponseGenerator
				}
			);
			//harcodedItemsToDispose.push(httpPublisherInstance);
			for (const publisherApiRestEndpoint of endpointsProvider.publisherApiRestEndpoints) {
				publisherApiRestEndpoint.addHttpPublisher(executionContext, httpPublisherInstance);
			}
			await httpPublisherInstance.init(executionContext);
			itemsToDispose.push(httpPublisherInstance);
		}

		// Setup WebSocketHost subscriber
		for (const hardcodedSubscriberConfiguration of hardcodedSubscriberConfigurations) {
			for (const subscriberId of hardcodedSubscriberConfiguration.subscriberIds) {
				const channelFactories: Array<MessageBus.ChannelFactory> = [];
				for (const topicName of hardcodedSubscriberConfiguration.topicNames) {
					const channelFactory = async (): Promise<MessageBus.Channel> => {
						const channel = await messageBusProvider.retainChannel(executionContext, topicName, subscriberId);
						return channel;
					}
					channelFactories.push(channelFactory);
				}

				for (const subscriberApiRestEndpoint of endpointsProvider.subscriberApiRestEndpoints) {
					const subscriberType = subscriberId.split(".")[1];
					switch (subscriberType) {
						case "websocket_host":
							const webSocketHostSubscriber = new WebSocketHostSubscriber(
								{
									baseBindPath: subscriberApiRestEndpoint.bindPath,
									bindServers: subscriberApiRestEndpoint.servers,
									subscriberId: subscriberId,
									channelFactories
								},
								FLogger.create(log.name + "." + WebSocketHostSubscriber.name),
							);
							await webSocketHostSubscriber.init(executionContext);
							itemsToDispose.push(webSocketHostSubscriber);
							break;
						case "http_client":
							const httpClientSubscriber = new HttpClientSubscriber(
								{
									deliveryHttpMethod: subscriberId.split(".")[2],
									deliveryUrl: new URL(subscriberId.split(".")[3]),
									subscriberId,
									channelFactories
								}
							);
							await httpClientSubscriber.init(executionContext);
							itemsToDispose.push(httpClientSubscriber);
							break;
						default:
							throw new FExceptionArgument(`Unsupported subscriber type ${subscriberType}`);
					}
				}
			}
		}
	} catch (e) {
		for (const hardcodedItem of itemsToDispose) { await hardcodedItem.dispose(); }

		await FDisposable.disposeAll(
			// Endpoints should dispose first (reply 503, while finishing all active requests)
			Container.get(EndpointsProvider),
			Container.get(HostingProvider),
			Container.get(MessageBusProvider),
			Container.get(StorageProvider)
		);
		throw e;
	}
	/* ------------------------ */

	return {
		async destroy() {
			log.info(executionContext, "Destroying DI runtime...");

			for (const hardcodedItem of itemsToDispose.reverse()) {
				await hardcodedItem.dispose();
			}

			await FDisposable.disposeAll(
				// Endpoints should dispose first (reply 503, while finishing all active requests)
				Container.get(EndpointsProvider),
				Container.get(HostingProvider),
				Container.get(MessageBusProvider),
				Container.get(StorageProvider)
			);
		}
	};

}

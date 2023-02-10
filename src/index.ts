import { FDisposable, FExecutionContext, FLoggerLabelsExecutionContext, FInitable, FLogger } from "@freemework/common";
import { FLauncherRuntime } from "@freemework/hosting";

import * as _ from "lodash";

// Providers
import { ConfigurationProvider, ConfigurationProviderImpl } from "./provider/ConfigurationProvider";
import { StorageProvider } from "./provider/StorageProvider";
import { EndpointsProvider } from "./provider/EndpointsProvider";
import { HostingProvider } from "./provider/HostingProvider";
import { MessageBusProvider } from "./provider/MessageBusProvider";
import { HttpPublisher } from "./publisher/HttpPublisher";
import { WebSocketHostSubscriber } from "./subscriber/WebSocketHostSubscriber";
import { MessageBus } from "./messaging/MessageBus";
import { Container } from "typescript-ioc";
import { Configuration } from "./Configuration";

// Re-export stuff for embedded user's
export * from "./api/errors";
export { ManagementApi } from "./api/ManagementApi";
export { PublisherApi } from "./api/PublisherApi";
export { SubscriberApi } from "./api/SubscriberApi";
export { ApiProvider } from "./provider/ApiProvider";
export { Configuration } from "./Configuration";
// export { ConfigurationProvider } from "./provider/ConfigurationProvider";
//export { EndpointsProvider } from "./provider/EndpointsProvider";
export { HostingProvider } from "./provider/HostingProvider";
//export { MessageBusProvider } from "./provider/MessageBusProvider";
//export { StorageProvider } from "./provider/StorageProvider";


const { name: serviceName, version: serviceVersion } = require("../package.json");

export default async function (executionContext: FExecutionContext, configuration: Configuration): Promise<FLauncherRuntime> {
	executionContext = new FLoggerLabelsExecutionContext(executionContext, { serviceName, serviceVersion });

	const log: FLogger = FLogger.create("EdgeBus");

	{
		log.info(executionContext, "Initializing ConfigurationProvider...");
		// const dbEncriptionKey = await passwordDerivation(configuration.dbEncryptionPassword);
		const ownProvider: ConfigurationProvider = new ConfigurationProviderImpl(configuration);
		Container.bind(ConfigurationProvider).provider({ get() { return ownProvider; } });
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
		const hardcodedPublisherConfigurations = [
			// {
			// 	topicName: "GITLAB",
			// 	topicDescription: "GITLAB Webhooks test topic",
			// 	publisherId: "publisher.http.5034c67f-f1cb-4fab-aed3-d2cd3b3d50ad"
			// },
			// {
			// 	topicName: "WTF1_WALLET_CREATE_TX",
			// 	topicDescription: "WALLET_CREATE_TX уведомление о
			//создании транзакции, либо подписи существующей (происходит при вызове таких методов как sendtoaddress, signtx)",
			// 	publisherId: "publisher.http.18af3285-749a-4fe8-abc0-52a42cd82cb6",
			// 	publisherPath: "/v1/notifications/wallet_create_tx",
			// 	publisherSuccessResponseGenerator: function () {
			// 		return {
			// 			headers: {
			// 				"Content-Type": "application/json"
			// 			},
			// 			body: Buffer.from(JSON.stringify({
			// 				success: true,
			// 				timestamp: Date.now()
			// 			})),
			// 			status: 200,
			// 			statusDescription: "OK"
			// 		};
			// 	}
			// },
			// {
			// 	topicName: "WTF1_WALLET_TX",
			// 	topicDescription: "WALLET_TX уведомление о поступлении транзакции,
			//на которую мы подписаны, имеется возможность подписаться только на приходящие(receive) или исходящие(send) транзакции.",
			// 	publisherId: "publisher.http.991b9ba2-7a76-4de9-8149-3489412a1288",
			// 	publisherPath: "/v1/notifications/wallet_tx",
			// 	publisherSuccessResponseGenerator: function () {
			// 		return {
			// 			headers: {
			// 				"Content-Type": "application/json"
			// 			},
			// 			body: Buffer.from(JSON.stringify({
			// 				success: true,
			// 				timestamp: Date.now()
			// 			})),
			// 			status: 200,
			// 			statusDescription: "OK"
			// 		};
			// 	}
			// },
			{
				topicName: "pss-provider-wtf2",
				topicDescription: "PSS Provider WTF2 callbacks",
				publisherId: "publisher.http.9028c574-98b6-4198-8fc7-1355e9ac622e",
				publisherPath: "/v2/callback/cryptoproviders/pss-provider-wtf2"
			},
			{
				topicName: "wtf2",
				topicDescription: "WTF2 callbacks",
				publisherId: "publisher.http.afb0ff9b-217d-4a5c-8b33-d76291bb7d81",
				publisherPath: "/v2/callback/cryptoproviders/wtf2"
			}
		];
		const hardcodedSubscriberConfigurations = [
			{
				topicNames: ["pss-provider-wtf2", "wtf2"],
				subscriberIds: [
					"subscriber.websockethost.devel",
					"subscriber.websockethost.evolution",
					"subscriber.websockethost.presentation",
					"subscriber.websockethost.serg4683-a00d-4269-b116-6959fb9ac889",
					"subscriber.websockethost.maks4683-a00d-4269-b116-6959fb9ac889"
				]
				// },
				// {
				// 	topicNames: ["wtf2"],
				// 	subscriberIds: [
				// 		"subscriber.websockethost.19ee1bff-d469-4b8c-b5a8-0fd66a8b4b96",
				// 		"subscriber.websockethost.serge263-11f9-4df6-acc8-88faee098c99",
				// 		"subscriber.websockethost.vovad688-f1c3-49fd-82b0-09cfb59d0c76",
				// 		"subscriber.websockethost.maksbaad-5b66-4378-8fe4-50f8033a5cee"
				// 	]
			}
		];


		const endpointsProvider: EndpointsProvider = Container.get(EndpointsProvider);
		const messageBusProvider: MessageBusProvider = Container.get(MessageBusProvider);

		// Setup HTTP publisher
		for (const hardcodedPublisherConfiguration of hardcodedPublisherConfigurations) {
			const httpPublisherInstance: HttpPublisher = new HttpPublisher(
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
				const channels: Array<MessageBus.Channel> = [];
				for (const topicName of hardcodedSubscriberConfiguration.topicNames) {
					const channel = await messageBusProvider.retainChannel(executionContext, topicName, subscriberId);
					itemsToDispose.push(channel);
					channels.push(channel);
				}

				for (const subscriberApiRestEndpoint of endpointsProvider.subscriberApiRestEndpoints) {
					const webSocketHostSubscriber = new WebSocketHostSubscriber(
						{
							baseBindPath: subscriberApiRestEndpoint.bindPath,
							bindServers: subscriberApiRestEndpoint.servers,
							subscriberId: subscriberId
						},
						FLogger.create(log.name + "." + WebSocketHostSubscriber.name),
						...channels
					);
					await webSocketHostSubscriber.init(executionContext);
					itemsToDispose.push(webSocketHostSubscriber);
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

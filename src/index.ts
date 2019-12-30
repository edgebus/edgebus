import { CancellationToken, Disposable as DisposableLike } from "@zxteam/contract";
import { Initable, Disposable, safeDispose } from "@zxteam/disposable";
import { Container, Runtime as LauncherRuntime } from "@zxteam/launcher";
import { logger } from "@zxteam/logger";

import * as _ from "lodash";

// Providers
import { ConfigurationProvider } from "./provider/ConfigurationProvider";
import { StorageProvider } from "./provider/StorageProvider";
import { EndpointsProvider } from "./provider/EndpointsProvider";
import { HostingProvider } from "./provider/HostingProvider";
import { MessageBusProvider } from "./provider/MessageBusProvider";
import { HttpPublisher } from "./publisher/HttpPublisher";
import { WebSocketHostSubscriber } from "./subscriber/WebSocketHostSubscriber";
import { MessageBus } from "./messaging/MessageBus";

// Re-export stuff for embedded user's
export * from "./api/errors";
export { ManagementApi } from "./api/ManagementApi";
export { PublisherApi } from "./api/PublisherApi";
export { SubscriberApi } from "./api/SubscriberApi";
export { ApiProvider } from "./provider/ApiProvider";
export { ConfigurationProvider } from "./provider/ConfigurationProvider";
//export { EndpointsProvider } from "./provider/EndpointsProvider";
export { HostingProvider } from "./provider/HostingProvider";
//export { MessageBusProvider } from "./provider/MessageBusProvider";
//export { StorageProvider } from "./provider/StorageProvider";



const { name: serviceName, version: serviceVersion } = require("../package.json");

export default async function (cancellationToken: CancellationToken, config: null): Promise<LauncherRuntime> {
	const log = logger.getLogger("RuntimeFactory");

	log.info(`Package: ${serviceName}@${serviceVersion}`);

	const configurationProvider: ConfigurationProvider = Container.get(ConfigurationProvider);

	log.info("Initializing ConfigurationProvider...");
	await configurationProvider.init(cancellationToken);
	try {

		log.info("Initializing DI runtime...");
		await Initable.initAll(cancellationToken,
			Container.get(StorageProvider),
			Container.get(MessageBusProvider),
			Container.get(EndpointsProvider),
			Container.get(HostingProvider)
		);



		/* ---------HARDCODE--------------- */
		const harcodedItemsToDispose: Array<DisposableLike> = [];
		try {
			const hardcodedPublisherConfigurations = [
				{
					topicName: "GITLAB",
					topicDescription: "GITLAB Webhooks test topic",
					publisherId: "publisher.http.5034c67f-f1cb-4fab-aed3-d2cd3b3d50ad"
				},
				{
					topicName: "WTF1_WALLET_CREATE_TX",
					topicDescription: "WALLET_CREATE_TX уведомление о создании транзакции, либо подписи существующей (происходит при вызове таких методов как sendtoaddress, signtx)",
					publisherId: "publisher.http.18af3285-749a-4fe8-abc0-52a42cd82cb6",
					publisherPath: "/v1/notifications/wallet_create_tx",
					publisherSuccessResponseGenerator: function () {
						return {
							headers: {
								"Content-Type": "application/json"
							},
							body: Buffer.from(JSON.stringify({
								success: true,
								timestamp: Date.now()
							})),
							status: 200,
							statusDescription: "OK"
						};
					}
				},
				{
					topicName: "WTF1_WALLET_TX",
					topicDescription: "WALLET_TX уведомление о поступлении транзакции, на которую мы подписаны, имеется возможность подписаться только на приходящие(receive) или исходящие(send) транзакции.",
					publisherId: "publisher.http.991b9ba2-7a76-4de9-8149-3489412a1288",
					publisherPath: "/v1/notifications/wallet_tx",
					publisherSuccessResponseGenerator: function () {
						return {
							headers: {
								"Content-Type": "application/json"
							},
							body: Buffer.from(JSON.stringify({
								success: true,
								timestamp: Date.now()
							})),
							status: 200,
							statusDescription: "OK"
						};
					}
				},
				{
					topicName: "WTF2PSS_EVENTS",
					topicDescription: "WTF2 PSS Provider's callbacks",
					publisherId: "publisher.http.9028c574-98b6-4198-8fc7-1355e9ac622e"
				}
			];
			const hardcodedSubscriberConfigurations = [
				{
					topicNames: ["GITLAB"],
					subscriberIds: ["subscriber.websockethost.41dd9c66-09ae-473d-a694-1dcfe347e8af"]
				},
				{
					topicNames: ["WTF1_WALLET_CREATE_TX", "WTF1_WALLET_TX", "WTF2PSS_EVENTS"],
					subscriberIds: [
						"subscriber.websockethost.8ed7cb38-1b9d-41bc-b3d4-8fc8aae324b3",
						"subscriber.websockethost.serg4683-a00d-4269-b116-6959fb9ac889",
						"subscriber.websockethost.vova4683-a00d-4269-b116-6959fb9ac889",
						"subscriber.websockethost.roma4683-a00d-4269-b116-6959fb9ac889",
						"subscriber.websockethost.maks4683-a00d-4269-b116-6959fb9ac889"
					]
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
						mediaType: "application/json"
					},
					hardcodedPublisherConfiguration.publisherId,
					messageBusProvider,
					{
						transformers: [],
						bindPath: hardcodedPublisherConfiguration.publisherPath,
						successResponseGenerator: hardcodedPublisherConfiguration.publisherSuccessResponseGenerator
					}
				);
				//harcodedItemsToDispose.push(httpPublisherInstance);
				for (const publisherApiRestEndpoint of endpointsProvider.publisherApiRestEndpoints) {
					publisherApiRestEndpoint.addHttpPublisher(httpPublisherInstance);
				}
			}

			// Setup WebSocketHost subscriber
			for (const hardcodedSubscriberConfiguration of hardcodedSubscriberConfigurations) {
				for (const subscriberId of hardcodedSubscriberConfiguration.subscriberIds) {
					const channels: Array<MessageBus.Channel> = [];
					for (const topicName of hardcodedSubscriberConfiguration.topicNames) {
						const channel = await messageBusProvider.retainChannel(cancellationToken, topicName, subscriberId);
						harcodedItemsToDispose.push(channel);
						channels.push(channel);
					}

					for (const subscriberApiRestEndpoint of endpointsProvider.subscriberApiRestEndpoints) {
						const webSocketHostSubscriber = new WebSocketHostSubscriber(
							{
								baseBindPath: subscriberApiRestEndpoint.bindPath,
								bindServers: subscriberApiRestEndpoint.servers,
								log,
								subscriberId: subscriberId
							},
							...channels
						);
						await webSocketHostSubscriber.init(cancellationToken);
						harcodedItemsToDispose.push(webSocketHostSubscriber);
					}
				}
			}
		} catch (e) {
			for (const hardcodedItem of harcodedItemsToDispose) { await safeDispose(hardcodedItem); }

			await Disposable.disposeAll(
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
				log.info("Destroying DI runtime...");

				for (const hardcodedItem of harcodedItemsToDispose) { await safeDispose(hardcodedItem); }

				await Disposable.disposeAll(
					// Endpoints should dispose first (reply 503, while finishing all active requests)
					Container.get(EndpointsProvider),
					Container.get(HostingProvider),
					Container.get(MessageBusProvider),
					Container.get(StorageProvider),
					configurationProvider
				);
			}
		};
	} catch (e) {
		await configurationProvider.dispose();
		throw e;
	}
}

import { CancellationToken, Logger } from "@zxteam/contract";
import { Initable, Disposable } from "@zxteam/disposable";

import { PostgresProviderFactory } from "@zxteam/sql-postgres";

import { PersistentStorage } from "./PersistentStorage";
import * as _ from "lodash";

import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";

export class SQLPersistentStorage extends Initable implements PersistentStorage {
	private readonly _sqlProviderFactory: PostgresProviderFactory;
	private readonly _log: Logger;
	private readonly _url: URL;

	public constructor(url: URL, log: Logger) {
		super();
		this._url = url;
		this._log = log;

		this._sqlProviderFactory = new PostgresProviderFactory({
			url: this._url,
			log: this._log,
			applicationName: "notifier.service"
		});
	}

	public async getAvailableTopics(cancellationToken: CancellationToken): Promise<Topic[]> {
		this.verifyInitializedAndNotDisposed();

		const sqlProvider = await this._sqlProviderFactory.create(cancellationToken);

		try {
			const friendlyTopics: any[] = [];

			const topics = await sqlProvider
				.statement(`SELECT "id", "name", "description" FROM ${this.dbPublicName}topics;`)
				.executeQuery(cancellationToken);

			return friendlyTopics;
		} finally {
			await sqlProvider.dispose();
		}

		// const friendlyTopics = [];
		// for (const topic of topics) {
		// 	helper.ensureString(topic, "id");
		// 	helper.ensureString(topic, "name");
		// 	helper.ensureString(topic, "description");

		// 	const friendlyTopic: Topic = {
		// 		topicId: topic.id.toString(),
		// 		name: topic.name,
		// 		description: topic.description,
		// 		topicSecurityKind: "TOKEN",
		// 		topicSecurityToken: "Ololo123:" + topic.id.toString(),
		// 		subscriberSecurityKind: "TOKEN",
		// 		subscriberSecurityToken: "Ololo123:" + topic.id.toString(),
		// 		publisherSecurityKind: "TOKEN",
		// 		publisherSecurityToken: "Ololo123:" + topic.id.toString()
		// 	};
		// 	friendlyTopics.push(friendlyTopic);


	}

	public addSubscriberWebhook(
		cancellationToken: CancellationToken,
		webhookData: Webhook.Data
	): Promise<Webhook.Id> {
		throw new Error("");
	}

	public getSubscriberWebhook(
		webhook: Webhook.Id["webhookId"]
	): Promise<Webhook> {
		throw new Error("Method not implemented.");
	}

	public removeSubscriberWebhook(
		cancellationToken: CancellationToken, webhook: Webhook.Id["webhookId"]
	): Promise<void> {
		throw new Error("");
	}

	protected async onInit(cancellationToken: CancellationToken): Promise<void> {
		await this._sqlProviderFactory.init(cancellationToken);
	}

	protected async onDispose(): Promise<void> {
		await this._sqlProviderFactory.dispose();
	}

	private get dbPublicName() {
		return this._url.pathname.substr(1) + ".public.";
	}

}

export namespace helper {

	export function ensureType<T, TKey extends keyof T>(target: T, key: TKey, checker: (v: T[TKey]) => boolean, typeMsg: string) {
		if (!checker(target[key])) {
			throw new TypeError(`Expected '${key}' to be ${typeMsg} `);
		}
	}
	export function ensureNullableType<T, TKey extends keyof T>(target: T, key: TKey, checker: (v: T[TKey]) => boolean, typeMsg: string) {
		if (target[key] !== null && !checker(target[key])) {
			throw new TypeError(`Expected '${key}' to be ${typeMsg} or null`);
		}
	}
	export function ensureInteger<T, TKey extends keyof T>(target: T, key: TKey) { ensureType(target, key, _.isInteger, "integer"); }
	export function ensureNumber<T, TKey extends keyof T>(target: T, key: TKey) { ensureType(target, key, _.isNumber, "number"); }
	export function ensureString<T, TKey extends keyof T>(target: T, key: TKey) { ensureType(target, key, _.isString, "string"); }
	export function ensureNullableInteger<T, TKey extends keyof T>(target: T, key: TKey) { ensureNullableType(target, key, _.isInteger, "integer"); }
	export function ensureNullableNumber<T, TKey extends keyof T>(target: T, key: TKey) {
		ensureNullableType(target, key, _.isNumber, "number");
	}
	export function ensureNullableString<T, TKey extends keyof T>(target: T, key: TKey) {
		ensureNullableType(target, key, _.isString, "string");
	}
}

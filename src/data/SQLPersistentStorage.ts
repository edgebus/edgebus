import { CancellationToken, Logger } from "@zxteam/contract";

import { Sequelize, Model, DataTypes } from "sequelize";
import { Topics, topicsRows, topicsOpts } from "./model/Topics";
import { PersistentStorage } from "./PersistentStorage";
import * as _ from "lodash";

import { Topic } from "../model/Topic";
import { Webhook } from "../model/Webhook";
import { RecipientUser } from "../model/RecipientUser";

export class SQLPersistentStorage implements PersistentStorage {

	private readonly _logger: Logger;
	private readonly _url: URL;

	public constructor(url: URL, log: Logger) {
		this._url = url;
		this._logger = log;
	}

	public async getAvailableTopics(cancellationToken: CancellationToken): Promise<Topic[]> {
		const topics: Topics[] = await helper.findAll(Topics);

		const friendlyTopics = [];
		for (const topic of topics) {
			helper.ensureString(topic, "id");
			helper.ensureString(topic, "name");
			helper.ensureString(topic, "description");

			const friendlyTopic: Topic = {
				topicId: topic.id.toString(),
				name: topic.name,
				description: topic.description,
				topicSecurityKind: "TOKEN",
				topicSecurityToken: "Ololo123:" + topic.id.toString(),
				subscriberSecurityKind: "TOKEN",
				subscriberSecurityToken: "Ololo123:" + topic.id.toString(),
				publisherSecurityKind: "TOKEN",
				publisherSecurityToken: "Ololo123:" + topic.id.toString()
			};
			friendlyTopics.push(friendlyTopic);
		}

		return friendlyTopics;
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

	public async dispose(): Promise<void> {
		//
	}

	public async init(cancellationToken: CancellationToken): Promise<this> {
		const sequelize = new Sequelize(this._url.href);
		Topics.init(topicsRows,
			{
				sequelize,
				tableName: topicsOpts.tableName,
				timestamps: topicsOpts.timestamps
			});

		return this;
	}
}


export namespace helper {
	// export async function findAll(model: any): Promise<any[]> {
	// 	return new Promise(async (resolve, reject) => {
	// 		await model.findAll()
	// 			.catch((e: any) => {
	// 				reject(e);
	// 			})
	// 			.then((result: any) => {
	// 				resolve(result);
	// 			});
	// 	});
	// }

	// Same behavior as commented above
	export async function findAll(model: any): Promise<any[]> {
		return model.findAll();
	}


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

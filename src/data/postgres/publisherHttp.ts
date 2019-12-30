import { CancellationToken } from "@zxteam/contract";
import { SqlProvider, SqlResultRecord } from "@zxteam/sql";

import { Topic } from "../../model/Topic";
import { Publisher } from "../../model/Publisher";

import { v4 as uuid } from "uuid";

// export async function save(
// 	cancellationToken: CancellationToken,
// 	sqlProvider: SqlProvider,
// 	data: Topic.Name & { sslOption: Publisher.Data["sslOption"] }
// ): Promise<Publisher> {

// 	const sqlInsert = "INSERT INTO publisher_http (id, topic_id, ssl_opts) VALUES ($1, (SELECT id FROM topic WHERE name = $2), $3)";

// 	const id: string = uuid();
// 	const sslOpt: string = JSON.stringify(data.sslOption);
// 	const values = [id, data.topicName, sslOpt];

// 	await sqlProvider.statement(sqlInsert).execute(cancellationToken, ...values);

// 	const sqlSelect
// 		= "SELECT 	p.id, p.topic_id, p.ssl_opts, p.utc_create_date, p.utc_delete_date, t.publisher_security FROM publisher_http AS p "
// 		+ "INNER JOIN topic AS t ON t.id=p.topic_id WHERE p.id=$1";
// 	const sqlSelectValue = [id];


// 	const sqlRow: SqlResultRecord = await sqlProvider.statement(sqlSelect).executeSingle(cancellationToken, ...sqlSelectValue);

// 	return mapDbRow(sqlRow);
// }

// function mapDbRow(sqlRow: SqlResultRecord): Publisher {
// 	const sslOption = sqlRow.get("ssl_opts").asObject;
// 	const publisherSecurity = sqlRow.get("publisher_security").asString;

// 	const dirtyCreatedAt: Date = sqlRow.get("utc_create_date").asDate;
// 	const dirtyDeletedAt: Date | null = sqlRow.get("utc_delete_date").asNullableDate;

// 	const publisher: Publisher = {
// 		publisherId: sqlRow.get("id").asString,
// 		sslOption,
// 		publisherSecurity: JSON.parse(publisherSecurity),
// 		createAt: new Date(dirtyCreatedAt.getTime() - dirtyCreatedAt.getTimezoneOffset() * 60000), // convert from UTC
// 		deleteAt: dirtyDeletedAt ? new Date(dirtyDeletedAt.getTime() - dirtyDeletedAt.getTimezoneOffset() * 60000) : null
// 	};

// 	return publisher;
// }

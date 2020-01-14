INSERT INTO "tb_topic" (
	"name", "description", "media_type", "topic_security"
) VALUES (
	'TICK_SECOND', 'Tick Topic sends current time every second', 'application/json', 
	'{"kind":"TOKEN","token":"8c59f72b84eab5db8ea7eaa42a579aec5461c69db31b8cb17aa1272f6333f050"}'
);
INSERT INTO "tb_topic" (
	"name", "description", "media_type", "topic_security"
) VALUES (
	'TICK_DECISECOND', 'Tick Topic sends current time every 1/10 of second', 'application/json', 
	'{"kind":"TOKEN","token":"93ecdd173290b83193c17e188e4266f10072a360320d25de0c2ba8ac4b1986ed"}'
);


INSERT INTO "tb_topic_publisher_secuity" (
	"topic_id",	"publisher_security"
) VALUES (
	(SELECT "id" FROM "tb_topic" WHERE "name" = 'TICK_SECOND'),
	'{"kind":"TOKEN","token":"3e940d84703b61260b08f328224b86aa03dca01021aea5af6afe2e1a850563f3"}'
);
INSERT INTO "tb_topic_publisher_secuity" (
	"topic_id",	"publisher_security"
) VALUES (
	(SELECT "id" FROM "tb_topic" WHERE "name" = 'TICK_SECOND'),
	'{"kind":"TOKEN","token":"c4279fd3f62621406ed176e5e12619dcbf6a5dc8a9323bc6faebfda7c2e8745d"}'
);


INSERT INTO "tb_topic_subscriber_secuity" (
	"topic_id",	"subscriber_security"
) VALUES (
	(SELECT "id" FROM "tb_topic" WHERE "name" = 'TICK_SECOND'),
	'{"kind":"TOKEN","token":"426f2eb55539922e71d0f840d6b20402755dd3ed96bd58ed169809de3a1331a8"}'
);
INSERT INTO "tb_topic_subscriber_secuity" (
	"topic_id",	"subscriber_security"
) VALUES (
	(SELECT "id" FROM "tb_topic" WHERE "name" = 'TICK_SECOND'),
	'{"kind":"TOKEN","token":"fe0ff7689d1205d82fdb5d1daaba6286467e1d61d4fbbac6ec6f3893ade6abd7"}'
);


INSERT INTO "tb_publisher" (
	"publisher_uuid", "topic_publisher_secuity_id", "data"
) VALUES (
	'82409d34-6d0e-4629-be9e-ad6402951986',
	(SELECT "id" FROM "tb_topic_publisher_secuity" WHERE "publisher_security" @> '{"kind":"TOKEN","token":"c4279fd3f62621406ed176e5e12619dcbf6a5dc8a9323bc6faebfda7c2e8745d"}'),
	'{"kind":"HTTP","ssl":{"clientTrustedCA":"-----BEGIN CERTIFICATE-----\\nMII.....\\n-----END CERTIFICATE-----","clientCommonName":"CN-MyPublisherSystem"},"mandatoryHeaders":{"X-Gitlab-Token":"My Strong Secret Token"},"converters":[{"kind":"javascript","code":"async function convert(input) { return input; }"},{"kind":"javascript","code":"async function convert(input) { return input; }"}]}'
);


INSERT INTO "tb_subscriber" (
	"subscriber_uuid", "topic_subscriber_secuity_id", "data", "utc_delete_date"
) VALUES (
	'82409d34-6d0e-4629-be9e-ad6402951986',
	(SELECT "id" FROM "tb_topic_subscriber_secuity" WHERE "subscriber_security" @> '{"kind":"TOKEN","token":"426f2eb55539922e71d0f840d6b20402755dd3ed96bd58ed169809de3a1331a8"}'),
	'{"TBD":"//"}',
	(NOW() AT TIME ZONE 'utc')
);

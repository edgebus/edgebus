INSERT INTO "tb_topic" (
	"name", "description", "media_type", "topic_security", "publisher_security", "subscriber_security"
) VALUES (
	'DEFAULT', 'Default Demo Topic', 'application/json', 
	'{"kind":"TOKEN","token":"8c59f72b84eab5db8ea7eaa42a579aec5461c69db31b8cb17aa1272f6333f050"}',
	'{"kind":"TOKEN","token":"759ebb9f1ed45f978479dc0cd2a7e01308bf538e64bac7813afb093c227e1c16"}',
	'{"kind":"TOKEN","token":"6dfb838fccd0021a66fa8dbce438a7293bc126f4f4cb921ef34062acf2ccc91a"}'
);

INSERT INTO "tb_publisher" (
	"publisher_uuid", "topic_id", "destroy_security", "opts", "converts"
) VALUES (
	'82409d34-6d0e-4629-be9e-ad6402951986',
	(SELECT "id" FROM "tb_topic" WHERE "name" = 'DEFAULT'),
	'{"kind":"TOKEN","token":"1eccc6978fc2e51ecea4496a9e4f20dfcedde9c88e84cb0ed38471a49031be59"}',
	'{"kind":"HTTP","ssl":{"clientTrustedCA":"-----BEGIN CERTIFICATE-----\\nMII.....\\n-----END CERTIFICATE-----","clientCommonName":"CN-MyPublisherSystem"},"mandatoryHeaders":{"X-Gitlab-Token":"My Strong Secret Token"}}',
	'[{"kind":"javascript","code":"async function convert(input) { return input; }"},{"kind":"javascript","code":"async function convert(input) { return input; }"}]'
);

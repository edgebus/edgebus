CREATE TYPE "{{database.schema.runtime.name}}"."INGRESS_KIND" AS ENUM (
	'HTTP_HOST', 'WEB_SOCKET_CLIENT', 'WEB_SOCKET_HOST'
);

{{#database.users}}
DROP ROLE IF EXISTS "{{.}}";

{{/database.users}}

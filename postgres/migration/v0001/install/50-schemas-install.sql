{{#database.schemas}}
CREATE SCHEMA "{{ name }}";
COMMENT ON SCHEMA "{{ name }}" IS '{{ desc }}';

{{/database.schemas}}

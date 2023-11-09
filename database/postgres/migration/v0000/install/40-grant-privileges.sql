GRANT SELECT, INSERT, DELETE ON TABLE "public"."__migration" TO "{{database.user.owner}}";
GRANT SELECT                 ON TABLE "public"."__migration" TO "{{database.user.api}}";
GRANT SELECT                 ON TABLE "public"."__migration" TO "{{database.user.readonly}}";

GRANT SELECT, INSERT, DELETE ON TABLE "public"."__migration_rollback_script" TO "{{database.user.owner}}";
GRANT SELECT                 ON TABLE "public"."__migration_rollback_script" TO "{{database.user.api}}";
GRANT SELECT                 ON TABLE "public"."__migration_rollback_script" TO "{{database.user.readonly}}";

GRANT USAGE ON SEQUENCE "public"."__migration_id_seq"                 TO "{{database.user.owner}}";
GRANT USAGE ON SEQUENCE "public"."__migration_rollback_script_id_seq" TO "{{database.user.owner}}";

REVOKE SELECT, INSERT, DELETE ON TABLE "public"."__migration" FROM "{{database.user.owner}}";
REVOKE SELECT                 ON TABLE "public"."__migration" FROM "{{database.user.api}}";
REVOKE SELECT                 ON TABLE "public"."__migration" FROM "{{database.user.readonly}}";

REVOKE SELECT, INSERT, DELETE ON TABLE "public"."__migration_rollback_script" FROM "{{database.user.owner}}";
REVOKE SELECT                 ON TABLE "public"."__migration_rollback_script" FROM "{{database.user.api}}";
REVOKE SELECT                 ON TABLE "public"."__migration_rollback_script" FROM "{{database.user.readonly}}";

REVOKE USAGE ON SEQUENCE "public"."__migration_id_seq"                 FROM "{{database.user.owner}}";
REVOKE USAGE ON SEQUENCE "public"."__migration_rollback_script_id_seq" FROM "{{database.user.owner}}";

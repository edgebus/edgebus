REVOKE SELECT, INSERT, DELETE ON TABLE "public"."__migration" FROM "{{database.user.owner}}";
REVOKE SELECT                 ON TABLE "public"."__migration" FROM "{{database.user.api}}";
REVOKE SELECT                 ON TABLE "public"."__migration" FROM "{{database.user.readonly}}";

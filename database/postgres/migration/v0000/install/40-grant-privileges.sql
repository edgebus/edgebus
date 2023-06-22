GRANT SELECT, INSERT, DELETE ON TABLE "public"."__migration" TO "{{database.user.owner}}";
GRANT SELECT                 ON TABLE "public"."__migration" TO "{{database.user.api}}";
GRANT SELECT                 ON TABLE "public"."__migration" TO "{{database.user.readonly}}";

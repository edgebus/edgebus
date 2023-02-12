ALTER DATABASE "{{database.name}}" OWNER TO "{{database.user.owner}}";
ALTER TABLE "public"."__migration" OWNER TO "{{database.user.owner}}";

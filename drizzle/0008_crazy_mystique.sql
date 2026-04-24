CREATE TABLE "community_reply_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"reply_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"is_like" boolean NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "community_reply_likes" ADD CONSTRAINT "community_reply_likes_reply_id_community_replies_id_fk" FOREIGN KEY ("reply_id") REFERENCES "public"."community_replies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_reply_likes" ADD CONSTRAINT "community_reply_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
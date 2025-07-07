CREATE TYPE "public"."difficulty" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TABLE "challenge_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"quiz_category_id" integer
);
--> statement-breakpoint
CREATE TABLE "code_snippets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" text NOT NULL,
	"html_code" text DEFAULT '',
	"css_code" text DEFAULT '',
	"js_code" text DEFAULT '',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"quiz_id" integer,
	"attempt_date" timestamp DEFAULT now(),
	"is_correct" boolean NOT NULL,
	"points_earned" integer
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenge_type_id" integer,
	"quiz_category_id" integer,
	"title" text NOT NULL,
	"description" text,
	"points" integer NOT NULL,
	"answer" text NOT NULL,
	"explanation" text,
	"difficulty" "difficulty" DEFAULT 'MEDIUM',
	"time_limit" integer,
	"options" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"quiz_category_id" integer,
	"total_quizzes" integer DEFAULT 0,
	"completed_quizzes" integer DEFAULT 0,
	"completion_percentage" real DEFAULT 0,
	CONSTRAINT "user_progress_user_id_quiz_category_id_unique" UNIQUE("user_id","quiz_category_id")
);
--> statement-breakpoint
CREATE TABLE "user_rankings" (
	"id" serial PRIMARY KEY NOT NULL,
	"rank_name" text NOT NULL,
	"min_points" integer NOT NULL,
	"max_points" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"unique_info" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"total_points" integer DEFAULT 0,
	"rank_id" integer,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "challenge_types" ADD CONSTRAINT "challenge_types_quiz_category_id_quiz_categories_id_fk" FOREIGN KEY ("quiz_category_id") REFERENCES "public"."quiz_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_snippets" ADD CONSTRAINT "code_snippets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_challenge_type_id_challenge_types_id_fk" FOREIGN KEY ("challenge_type_id") REFERENCES "public"."challenge_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_quiz_category_id_quiz_categories_id_fk" FOREIGN KEY ("quiz_category_id") REFERENCES "public"."quiz_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_quiz_category_id_quiz_categories_id_fk" FOREIGN KEY ("quiz_category_id") REFERENCES "public"."quiz_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_rank_id_user_rankings_id_fk" FOREIGN KEY ("rank_id") REFERENCES "public"."user_rankings"("id") ON DELETE no action ON UPDATE no action;
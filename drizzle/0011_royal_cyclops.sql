-- Create site_visits table to log all website visits (logged in or not)
CREATE TABLE "site_visits" (
  "id" serial PRIMARY KEY NOT NULL,
  "session_id" text,
  "user_id" integer REFERENCES "users"("id"),
  "page" text NOT NULL,
  "referrer" text,
  "user_agent" text,
  "visited_at" timestamp DEFAULT NOW()
);

-- Index for faster queries on visited_at
CREATE INDEX "site_visits_visited_at_idx" ON "site_visits"("visited_at");

-- Index for session_id lookups
CREATE INDEX "site_visits_session_id_idx" ON "site_visits"("session_id");

-- Index for user_id lookups
CREATE INDEX "site_visits_user_id_idx" ON "site_visits"("user_id");
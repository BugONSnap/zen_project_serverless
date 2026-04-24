-- Create admin_visits table to log admin page visits
CREATE TABLE "admin_visits" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer REFERENCES "users"("id") NOT NULL,
  "page" text NOT NULL,
  "visited_at" timestamp DEFAULT NOW()
);

-- Index for faster queries on visited_at
CREATE INDEX "admin_visits_visited_at_idx" ON "admin_visits"("visited_at");
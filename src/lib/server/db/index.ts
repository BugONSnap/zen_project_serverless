import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

// Merge schema and tables
const mergedSchema = {
  ...schema,
};

export const db = drizzle(sql, { schema: mergedSchema });

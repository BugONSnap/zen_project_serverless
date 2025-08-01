import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('zen.db');

// Merge schema and tables
const mergedSchema = {
	...schema,
	
};

export const db = drizzle(sqlite, { schema: mergedSchema });

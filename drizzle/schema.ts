import { pgTable, serial, text, integer, foreignKey, unique, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const userRankings = pgTable("user_rankings", {
	id: serial().primaryKey().notNull(),
	rankName: text("rank_name").notNull(),
	minPoints: integer("min_points").notNull(),
	maxPoints: integer("max_points"),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	uniqueInfo: text("unique_info").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	totalPoints: integer("total_points").default(0),
	rankId: integer("rank_id"),
}, (table) => [
	foreignKey({
			columns: [table.rankId],
			foreignColumns: [userRankings.id],
			name: "users_rank_id_user_rankings_id_fk"
		}),
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

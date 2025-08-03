import { relations } from "drizzle-orm/relations";
import { userRankings, users } from "./schema";

export const usersRelations = relations(users, ({one}) => ({
	userRanking: one(userRankings, {
		fields: [users.rankId],
		references: [userRankings.id]
	}),
}));

export const userRankingsRelations = relations(userRankings, ({many}) => ({
	users: many(users),
}));
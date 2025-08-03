import type { PageServerLoad } from "./$types";
import { db } from "$lib/server";
import { users, quizResults } from "$lib/server/db/schema";
import { desc, sum, eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals }) => {
  // Fetch leaderboard: username, total_points (sum of all quiz scores)
  const leaderboardRaw = await db
    .select({
      username: users.username,
      total_points: sum(quizResults.pointsEarned).as("total_points"),
    })
    .from(users)
    .leftJoin(quizResults, eq(quizResults.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(sum(quizResults.pointsEarned)));

  // Add rank (since .orderBy uses alias, this works)
  const leaderboard = leaderboardRaw.map((entry, i) => ({
    ...entry,
    rank: i + 1,
  }));

  console.log(leaderboard);

  // Get user data for the header
  const user = locals.user
    ? {
        id: locals.user.id,
        username: locals.user.username,
        email: locals.user.email,
      }
    : undefined;

  return { leaderboard, user };
};

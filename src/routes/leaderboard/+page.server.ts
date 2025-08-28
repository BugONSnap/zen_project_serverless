import type { PageServerLoad } from "./$types";
import { db } from "$lib/server";
import { users, quizResults } from "$lib/server/db/schema";
import { desc, sum, eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals }) => {
  // Fetch leaderboard: username, total_points (prefer users.totalPoints, fallback to sum of quizResults.pointsEarned)
  const leaderboardRaw = await db
    .select({
      username: users.username,
      // Use users.totalPoints if available, otherwise fallback to sum(quizResults.pointsEarned)
      total_points: users.totalPoints,
      admin_level: users.adminLevel,
    })
    .from(users)
    .where(eq(users.adminLevel, 2)) // Only include regular users (adminLevel 2)
    .orderBy(desc(users.totalPoints));

  // Add rank (descending by points)
  const leaderboard = leaderboardRaw.map((entry, i) => ({
    ...entry,
    rank: i + 1,
  }));

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

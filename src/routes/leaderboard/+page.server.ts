import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, quizResults } from '$lib/server/db/schema';
import { desc, sum, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    // Fetch leaderboard: username, total_points (sum of all quiz scores)
    const leaderboardRaw = await db
        .select({
            username: users.username,
            total_points: sum(quizResults.pointsEarned).as('total_points')
        })
        .from(users)
        .leftJoin(quizResults, eq(quizResults.userId, users.id))
        .groupBy(users.id)
        .orderBy(desc(sum(quizResults.pointsEarned)));

    // Add rank (since .orderBy uses alias, this works)
    const leaderboard = leaderboardRaw.map((entry, i) => ({ ...entry, rank: i + 1 }));

    return { leaderboard };
}; 
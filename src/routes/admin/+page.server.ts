import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, quizzes, userProgress, quizCategories, quizResults, community, communityLikes, communityReplies, communityReplyLikes, userTypes } from "$lib/server/db/schema";
import { eq, sql, count, gte, and } from "drizzle-orm";

export const load: PageServerLoad = async ({ cookies }) => {
  // Database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/dbname",
  });
  const db = drizzle(pool);

  try {
    // Check for session cookie
    const session = cookies.get("session");
    if (!session) {
      throw redirect(302, "/");
    }

    // Fetch user data to verify adminLevel
    const userData = await db
      .select({
        id: users.id,
        username: users.username,
        adminLevel: users.adminLevel,
      })
      .from(users)
      .where(eq(users.id, parseInt(session)))
      .limit(1);

    if (userData.length === 0) {
      throw redirect(302, "/");
    }

    const user = userData[0];
    // Check if user is super admin (0) or admin (1)
    const isAuthorized = user.adminLevel === 0 || user.adminLevel === 1;

    if (!isAuthorized) {
      throw redirect(302, "/");
    }

    // Get total users count
    const [totalUsers] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);

    // Get active quizzes count (quizzes that have been attempted at least once)
    let activeQuizzesCount = 0;
    try {
      const [result] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${quizzes.id})` })
        .from(quizzes)
        .innerJoin(quizResults, eq(quizzes.id, quizResults.quizId));
      activeQuizzesCount = Number(result?.count) || 0;
    } catch (error) {
      console.error('Error counting active quizzes:', error);
      activeQuizzesCount = 0;
    }

    // Get total quiz categories count
    const [quizCategoriesCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(quizCategories);

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Weekly Report Metrics
    // 1. Community posts from last 7 days
    const [communityPostsCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(community)
      .where(gte(community.createdAt, sevenDaysAgo));

    // 2. Unique users who posted in community (last 7 days)
    const [uniquePostersResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${community.userId})` })
      .from(community)
      .where(gte(community.createdAt, sevenDaysAgo));

    // 3. Engagement metrics (last 7 days)
    const [likesCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(communityLikes)
      .where(gte(communityLikes.createdAt, sevenDaysAgo));

    const [repliesCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(communityReplies)
      .where(gte(communityReplies.createdAt, sevenDaysAgo));

    const [replyLikesCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(communityReplyLikes)
      .where(gte(communityReplyLikes.createdAt, sevenDaysAgo));

    const totalEngagement = Number(likesCount?.count || 0) + Number(repliesCount?.count || 0) + Number(replyLikesCount?.count || 0);

    // 4. New user registrations by type (last 7 days)
    const newUsersByType = await db
      .select({
        userTypeName: userTypes.name,
        count: sql<number>`COUNT(*)`,
      })
      .from(users)
      .innerJoin(userTypes, eq(users.userTypeId, userTypes.id))
      .where(gte(users.createdAt, sevenDaysAgo))
      .groupBy(userTypes.name);

    // Format user registrations by type
    const registrationsByType = {
      STUDENT: 0,
      PROFESSIONAL: 0,
      HOBBYIST: 0,
    };
    newUsersByType.forEach((item) => {
      const typeName = item.userTypeName.toUpperCase();
      if (typeName in registrationsByType) {
        registrationsByType[typeName as keyof typeof registrationsByType] = Number(item.count);
      }
    });

    // 5. Total new registrations (last 7 days)
    const [newUsersCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo));

    // 6. Quiz attempts (last 7 days)
    const [quizAttemptsCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(quizResults)
      .where(gte(quizResults.attemptDate, sevenDaysAgo));

    // 7. Active users (users who did something in last 7 days)
    const activeUsersQuery = await db
      .select({ userId: users.id })
      .from(users)
      .where(gte(users.createdAt, sevenDaysAgo));
    
    // Also count users who posted, liked, or replied
    const [activeCommunityUsers] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${community.userId})` })
      .from(community)
      .where(gte(community.createdAt, sevenDaysAgo));

    return {
      loading: false,
      isAuthorized: true,
      username: user.username,
      weeklyReport: {
        communityPosts: Number(communityPostsCount?.count || 0),
        uniquePosters: Number(uniquePostersResult?.count || 0),
        totalEngagement: totalEngagement,
        likes: Number(likesCount?.count || 0),
        replies: Number(repliesCount?.count || 0),
        replyLikes: Number(replyLikesCount?.count || 0),
        newRegistrations: Number(newUsersCount?.count || 0),
        registrationsByType: registrationsByType,
        quizAttempts: Number(quizAttemptsCount?.count || 0),
        activeUsers: Number(activeCommunityUsers?.count || 0),
      },
      stats: {
        totalUsers: Number(totalUsers?.count) || 0,
        activeQuizzes: activeQuizzesCount,
        totalCategories: Number(quizCategoriesCount?.count) || 0
      },
      error: "",
    };
  } catch (error) {
    // Handle redirect errors or other issues
    if (error instanceof Response) {
      throw error; // Redirect to /login
    }
    console.error("Admin page load error:", error);
    return {
      loading: false,
      isAuthorized: false,
      username: null,
      error: "An error occurred while verifying access.",
    };
  } finally {
    await pool.end();
  }
};
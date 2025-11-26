import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, quizzes, userProgress, quizCategories, quizResults } from "$lib/server/db/schema";
import { eq, sql, count } from "drizzle-orm";

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

    return {
      loading: false,
      isAuthorized: true,
      username: user.username,
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
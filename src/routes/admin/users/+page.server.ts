import type { PageServerLoad, Actions } from "./$types";
import { redirect, fail } from "@sveltejs/kit";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, userRankings, userProgress, quizCategories, quizResults, codeSnippets } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";

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
      throw redirect(302, "/login");
    }

    // Verify admin access and get current user's adminLevel
    const currentUserData = await db
      .select({
        id: users.id,
        adminLevel: users.adminLevel,
      })
      .from(users)
      .where(eq(users.id, parseInt(session)))
      .limit(1);

    if (currentUserData.length === 0 || (currentUserData[0].adminLevel !== 0 && currentUserData[0].adminLevel !== 1)) {
      throw redirect(302, "/login");
    }

    // Fetch all users with their rank and progress
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        adminLevel: users.adminLevel,
        rankName: userRankings.rankName,
      })
      .from(users)
      .leftJoin(userRankings, eq(users.rankId, userRankings.id));

    // Fetch user progress for each user
    const userProgressData = await db
      .select({
        userId: userProgress.userId,
        categoryName: quizCategories.name,
        completionPercentage: userProgress.completionPercentage,
      })
      .from(userProgress)
      .leftJoin(quizCategories, eq(userProgress.quizCategoryId, quizCategories.id));

    // Aggregate progress by user
    const progressByUser = allUsers.map(user => {
      const userProgressItems = userProgressData
        .filter(progress => progress.userId === user.id)
        .map(progress => `${progress.categoryName}: ${progress.completionPercentage}%`)
        .join(", ");
      return {
        ...user,
        progress: userProgressItems || "No progress",
        role: user.adminLevel === 0 ? "Super Admin" : user.adminLevel === 1 ? "Admin" : "User",
      };
    });

    return {
      users: progressByUser,
      currentUserAdminLevel: currentUserData[0].adminLevel,
      loading: false,
      error: "",
    };
  } catch (error) {
    if (error instanceof Response) {
      throw error; // Redirect to /login
    }
    console.error("Users page load error:", error);
    return {
      users: [],
      currentUserAdminLevel: null,
      loading: false,
      error: "An error occurred while fetching users.",
    };
  } finally {
    await pool.end();
  }
};

export const actions: Actions = {
  changeRole: async ({ request, cookies }) => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/dbname",
    });
    const db = drizzle(pool);

    try {
      // Verify super admin
      const session = cookies.get("session");
      if (!session) {
        return fail(401, { error: "Unauthorized" });
      }

      const currentUser = await db
        .select({ adminLevel: users.adminLevel })
        .from(users)
        .where(eq(users.id, parseInt(session)))
        .limit(1);

      if (currentUser.length === 0 || currentUser[0].adminLevel !== 0) {
        return fail(403, { error: "Only super admins can change roles" });
      }

      // Get form data
      const formData = await request.formData();
      const userId = parseInt(formData.get("userId") as string);
      const newRole = parseInt(formData.get("adminLevel") as string);

      if (isNaN(userId) || isNaN(newRole) || ![0, 1, 2].includes(newRole)) {
        return fail(400, { error: "Invalid user ID or role" });
      }

      // Prevent super admin from demoting themselves
      if (userId === parseInt(session) && newRole !== 0) {
        return fail(403, { error: "Super admins cannot change their own role" });
      }

      // Update user role
      await db
        .update(users)
        .set({ adminLevel: newRole })
        .where(eq(users.id, userId));

      return { success: true, message: "Role updated successfully" };
    } catch (error) {
      console.error("Change role error:", error);
      return fail(500, { error: "Failed to update role" });
    } finally {
      await pool.end();
    }
  },

  deleteUser: async ({ request, cookies }) => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || "postgres://user:password@localhost:5432/dbname",
    });
    const db = drizzle(pool);

    try {
      // Verify super admin
      const session = cookies.get("session");
      if (!session) {
        return fail(401, { error: "Unauthorized" });
      }

      const currentUser = await db
        .select({ adminLevel: users.adminLevel })
        .from(users)
        .where(eq(users.id, parseInt(session)))
        .limit(1);

      if (currentUser.length === 0 || currentUser[0].adminLevel !== 0) {
        return fail(403, { error: "Only super admins can delete users" });
      }

      // Get form data
      const formData = await request.formData();
      const userId = parseInt(formData.get("userId") as string);

      if (isNaN(userId)) {
        return fail(400, { error: "Invalid user ID" });
      }

      // Prevent super admin from deleting themselves
      if (userId === parseInt(session)) {
        return fail(403, { error: "Super admins cannot delete their own account" });
      }

      // Delete related data (if no ON DELETE CASCADE)
      await db.delete(userProgress).where(eq(userProgress.userId, userId));
      await db.delete(quizResults).where(eq(quizResults.userId, userId));
      await db.delete(codeSnippets).where(eq(codeSnippets.userId, userId));

      // Delete user
      await db.delete(users).where(eq(users.id, userId));

      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      console.error("Delete user error:", error);
      return fail(500, { error: "Failed to delete user" });
    } finally {
      await pool.end();
    }
  },
};
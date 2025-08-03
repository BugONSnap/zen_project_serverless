import type { PageServerLoad } from "./$types";
import { db } from "$lib/server";
import { users, userProgress, quizCategories } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect, error as svelteError } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
  const userId = locals.user?.id;
  if (!userId) {
    throw redirect(302, "/login");
  }

  // Get user data
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) {
    throw svelteError(404, "User not found");
  }

  // Get all quiz categories
  const categories = await db.query.quizCategories.findMany();

  // Get user progress for each category
  const progress = await db.query.userProgress.findMany({
    where: eq(userProgress.userId, userId),
    with: {
      quizCategory: true,
    },
  });

  // Calculate total completed quizzes
  const totalCompleted = progress.reduce(
    (acc, curr) => acc + (curr.completedQuizzes || 0),
    0
  );

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    totalPoints: user.totalPoints || 0,
    totalCompleted,
    categories: categories.map((category) => {
      const categoryProgress = progress.find(
        (p) => p.quizCategoryId === category.id
      );
      return {
        id: category.id,
        name: category.name,
        completed: categoryProgress?.completedQuizzes || 0,
        total: categoryProgress?.totalQuizzes || 0,
        progress: categoryProgress?.completionPercentage || 0,
      };
    }),
  };
};

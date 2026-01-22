import type { PageServerLoad } from "./$types";
import { db } from "$lib/server";
import { users, userProgress, community } from "$lib/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect, error as svelteError } from "@sveltejs/kit";
import type { Locals } from "$lib/server/types";

export const load: PageServerLoad = async ({ locals }: { locals: Locals }) => {
  const userId = locals.user?.id;
  if (!userId) {
    throw redirect(302, "/");
  }

  // Get user data
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      userType: true,
    },
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

  // Get user's community posts
  const userPosts = await db.query.community.findMany({
    where: eq(community.userId, userId),
    orderBy: desc(community.createdAt),
    with: {
      user: {
        with: {
          userType: true,
        },
      },
      likes: {
        with: {
          user: true,
        },
      },
      replies: {
        with: {
          user: true,
          likes: {
            with: {
              user: true,
            },
          },
        },
      },
    },
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      totalPoints: user.totalPoints,
      createdAt: user.createdAt,
      userType: user.userType?.name || null,
    },
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
    posts: userPosts,
  };
};

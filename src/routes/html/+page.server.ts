import type { PageServerLoad } from "./$types";
import { db } from "$lib/server";
import { quizzes, quizCategories, users, quizResults } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals }) => {
  // Find the HTML category
  const htmlCategory = await db.query.quizCategories.findFirst({
    where: eq(quizCategories.name, "HTML"),
  });
  if (!htmlCategory) {
    return { quizzes: [] };
  }

  // Fetch quizzes for the HTML category
  const htmlQuizzes = await db.query.quizzes.findMany({
    where: eq(quizzes.quizCategoryId, htmlCategory.id),
  });

  // Map to only needed fields
  const quizzesList = htmlQuizzes.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    explanation: q.explanation,
    difficulty: q.difficulty,
    options: q.options,
  }));

  const userId = locals.user?.id;
  let user = undefined;
  let answeredQuizIds: number[] = [];
  if (userId) {
    user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (user) {
      user = { id: user.id, username: user.username, email: user.email };
      // Fetch IDs of quizzes already answered correctly by this user
      const results = await db.query.quizResults.findMany({
        where: and(
          eq(quizResults.userId, userId),
          eq(quizResults.isCorrect, true)
        )
      });
      answeredQuizIds = results.map(r => r.quizId).filter((id): id is number => id !== null);
    }
  }
  return { quizzes: quizzesList, user, answeredQuizIds };

};

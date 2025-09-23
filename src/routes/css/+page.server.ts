import type { PageServerLoad } from "./$types";
import { db } from "$lib/server";
import { quizzes, quizCategories, users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals }) => {
  // Find the CSS category
  const cssCategory = await db.query.quizCategories.findFirst({
    where: eq(quizCategories.name, "CSS"),
  });
  if (!cssCategory) {
    return { quizzes: [] };
  }

  // Fetch quizzes for the CSS category
  const cssQuizzes = await db.query.quizzes.findMany({
    where: eq(quizzes.quizCategoryId, cssCategory.id),
  });

  // Map to only needed fields
  const quizzesList = cssQuizzes.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    explanation: q.explanation,
    difficulty: q.difficulty,
    options: q.options,
    answer: q.answer,
  }));

  const userId = locals.user?.id;
  let user = undefined;
  if (userId) {
    user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (user) {
      user = { id: user.id, username: user.username, email: user.email };
    }
  }
  return { quizzes: quizzesList, user };

};

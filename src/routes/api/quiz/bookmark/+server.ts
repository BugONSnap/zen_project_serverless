import { db } from "$lib/server";
import {
  quizResults,
  quizzes,
  users,
  userProgress,
} from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import { json } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

// PATCH: Save quiz bookmark (lastQuizId, lastQuestionIndex) for user
export async function PATCH({ request, locals }: RequestEvent) {
  const { quizCategoryId, lastQuizId, lastQuestionIndex } = await request.json();
  const userId = locals.user?.id;
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

  // Find or create user progress for this category
  let progress = await db.query.userProgress.findFirst({
    where: and(
      eq(userProgress.userId, userId),
      eq(userProgress.quizCategoryId, quizCategoryId)
    ),
  });
  if (progress) {
    await db.update(userProgress)
      .set({ lastQuizId, lastQuestionIndex })
      .where(eq(userProgress.id, progress.id));
  } else {
    await db.insert(userProgress).values({
      userId,
      quizCategoryId,
      lastQuizId,
      lastQuestionIndex,
    });
  }
  return json({ success: true });
}

// GET: Fetch quiz bookmark for user/category
export async function GET({ url, locals }: RequestEvent) {
  const quizCategoryId = Number(url.searchParams.get("quizCategoryId"));
  const userId = locals.user?.id;
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });
  if (!quizCategoryId) return json({ error: "Missing quizCategoryId" }, { status: 400 });
  const progress = await db.query.userProgress.findFirst({
    where: and(
      eq(userProgress.userId, userId),
      eq(userProgress.quizCategoryId, quizCategoryId)
    ),
  });
  if (!progress) return json({});
  return json({
    lastQuizId: progress.lastQuizId,
    lastQuestionIndex: progress.lastQuestionIndex,
  });
}

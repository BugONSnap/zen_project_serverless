import { json } from '@sveltejs/kit';
import { db } from '$lib/server/index';
import { quizAttempts, quizzes } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// API: Get the most recent in-progress quiz attempt for the logged-in user
export async function GET({ locals }) {
  const userId = locals.user?.id;
  if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

  // Get all in-progress attempts for the user, most recent first
  const attempts = await db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, userId),
    orderBy: [quizAttempts.updatedAt.desc()]
  });

  // Filter for in-progress
  const inProgress = attempts.find(a => a.status === 'IN_PROGRESS');
  if (!inProgress) return json({});

  // Fetch quiz info
  const quiz = await db.query.quizzes.findFirst({ where: eq(quizzes.id, inProgress.quizId) });

  return json({
    quizId: inProgress.quizId,
    title: quiz?.title,
    categoryId: quiz?.quizCategoryId,
    status: inProgress.status
  });
}

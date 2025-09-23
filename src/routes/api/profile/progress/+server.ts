import { json } from '@sveltejs/kit';
import { db } from '$lib/server/index';
import { quizAttempts, quizzes } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

// API: Get all in-progress quiz attempts for the logged-in user, with quiz info
export async function GET({ locals }) {
  const userId = locals.user?.id;
  if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

  // Get all in-progress attempts for the user
  const attempts = await db.query.quizAttempts.findMany({
    where: eq(quizAttempts.userId, userId)
  });

  // Filter for in-progress
  const inProgress = attempts.filter(a => a.status === 'IN_PROGRESS');

  // Fetch quiz info for each attempt
  const quizIds = inProgress.map(a => a.quizId).filter((id): id is number => typeof id === 'number');
  let quizzesInfo: any[] = [];
  if (quizIds.length > 0) {
    quizzesInfo = await db.query.quizzes.findMany({
      where: inArray(quizzes.id, quizIds)
    });
  }

  // Join attempt progress with quiz info
  // Deduplicate by quizId, keeping only the latest attempt per quiz
const latestAttemptsMap = new Map();
inProgress.forEach(attempt => {
  const prev = latestAttemptsMap.get(attempt.quizId);
  if (!prev) {
    latestAttemptsMap.set(attempt.quizId, attempt);
  } else if (attempt.updatedAt && prev.updatedAt) {
    if (new Date(attempt.updatedAt as string) > new Date(prev.updatedAt as string)) {
      latestAttemptsMap.set(attempt.quizId, attempt);
    }
  } else if (attempt.updatedAt && !prev.updatedAt) {
    latestAttemptsMap.set(attempt.quizId, attempt);
  }
});
const latestAttempts = Array.from(latestAttemptsMap.values());

const result = latestAttempts.map(attempt => {
  const quiz = quizzesInfo.find(q => q.id === attempt.quizId) || {};
  return {
    quizId: attempt.quizId,
    title: quiz.title,
    categoryId: quiz.quizCategoryId,
    currentStep: attempt.currentStep,
    status: attempt.status,
    timeRemaining: attempt.timeRemaining,
    challengeType: quiz.challengeTypeId
  };
});

  return json({ attempts: result });
}

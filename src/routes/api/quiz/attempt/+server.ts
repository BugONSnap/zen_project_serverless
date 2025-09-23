import { json } from '@sveltejs/kit';
import { db } from '$lib/server/index';
import { quizAttempts } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// PATCH: Save or update quiz attempt progress
export async function PATCH({ request, locals }) {
  const userId = locals.user?.id;
  if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });
  const { quizId, currentStep, status, timeRemaining } = await request.json();
  if (!quizId) return json({ error: 'Missing quizId' }, { status: 400 });

  // Find existing attempt for this user/quiz with IN_PROGRESS status
  let attempt = await db.query.quizAttempts.findFirst({
    where: and(
      eq(quizAttempts.userId, userId),
      eq(quizAttempts.quizId, quizId),
      eq(quizAttempts.status, 'IN_PROGRESS')
    )
  });

  if (attempt) {
    // If status is changing (e.g., to COMPLETED or ABANDONED), update the same row
    await db.update(quizAttempts)
      .set({ currentStep, status, timeRemaining, updatedAt: new Date() })
      .where(eq(quizAttempts.id, attempt.id));
  } else {
    // Only insert if no IN_PROGRESS attempt exists
    await db.insert(quizAttempts).values({
      userId,
      quizId,
      currentStep,
      status,
      timeRemaining,
      startedAt: new Date(),
      updatedAt: new Date()
    });
  }
  return json({ success: true });
}

// GET: Fetch latest quiz attempt (not completed)
export async function GET({ url, locals }) {
  const userId = locals.user?.id;
  if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });
  const quizId = Number(url.searchParams.get('quizId'));
  if (!quizId) return json({ error: 'Missing quizId' }, { status: 400 });

  const attempt = await db.query.quizAttempts.findFirst({
    where: and(
      eq(quizAttempts.userId, userId),
      eq(quizAttempts.quizId, quizId),
      eq(quizAttempts.status, 'IN_PROGRESS')
    )
  });

  if (!attempt) return json({});
  return json({
    currentStep: attempt.currentStep,
    timeRemaining: attempt.timeRemaining,
    status: attempt.status
  });
}

import { db } from '$lib/server/db';
import { quizResults, quizzes, users, userProgress } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ request, locals }: RequestEvent) {
    const { quizId, isCorrect } = await request.json();
    // @ts-ignore
    const userId = locals.user?.id;
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch the quiz to get its points value and category
    const quiz = await db.query.quizzes.findFirst({ where: eq(quizzes.id, quizId) });
    const points = quiz && isCorrect ? quiz.points : 0;

    // Save the quiz result
    await db.insert(quizResults).values({
        userId,
        quizId,
        isCorrect,
        pointsEarned: points,
        attemptDate: new Date()
    });

    // Update the user's total points if correct
    if (isCorrect && points > 0 && quiz) {
        // Get current totalPoints
        const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
        const newTotal = (user?.totalPoints || 0) + points;
        await db.update(users)
            .set({ totalPoints: newTotal })
            .where(eq(users.id, userId));

        // Update user_progress
        // Ensure quiz.quizCategoryId is not null or undefined
        if (quiz.quizCategoryId == null) {
            return json({ error: 'Quiz category not found' }, { status: 400 });
        }
        // Get total quizzes in this category
        const totalQuizzes = await db.query.quizzes.findMany({ where: eq(quizzes.quizCategoryId, quiz.quizCategoryId) });
        const total = totalQuizzes.length || 1;
        let progress = await db.query.userProgress.findFirst({
            where: and(
                eq(userProgress.userId, userId),
                eq(userProgress.quizCategoryId, quiz.quizCategoryId)
            )
        });
        if (progress) {
            const newCompleted = (progress.completedQuizzes || 0) + 1;
            const completionPercentage = Math.round((newCompleted / total) * 100);
            await db.update(userProgress)
                .set({
                    completedQuizzes: newCompleted,
                    totalQuizzes: total,
                    completionPercentage
                })
                .where(eq(userProgress.id, progress.id));
        } else {
            await db.insert(userProgress).values({
                userId,
                quizCategoryId: quiz.quizCategoryId,
                completedQuizzes: 1,
                totalQuizzes: total,
                completionPercentage: Math.round((1 / total) * 100)
            });
        }
    }

    return json({ success: true });
} 
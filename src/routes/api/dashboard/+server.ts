import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, userProgress, quizCategories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

interface Locals {
    user?: {
        id: number;
    };
}

export const GET: RequestHandler = async ({ locals }: { locals: Locals }) => {
    try {
        const userId = locals.user?.id;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user data
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });

        if (!user) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        // Get all quiz categories
        const categories = await db.query.quizCategories.findMany();

        // Get user progress for each category
        const progress = await db.query.userProgress.findMany({
            where: eq(userProgress.userId, userId),
            with: {
                quizCategory: true
            }
        });

        // Calculate total completed quizzes
        const totalCompleted = progress.reduce((acc, curr) => acc + (curr.completedQuizzes || 0), 0);

        return json({
            totalPoints: user.totalPoints || 0,
            totalCompleted,
            categories: categories.map(category => {
                const categoryProgress = progress.find(p => p.quizCategoryId === category.id);
                return {
                    id: category.id,
                    name: category.name,
                    completed: categoryProgress?.completedQuizzes || 0,
                    total: categoryProgress?.totalQuizzes || 0,
                    progress: categoryProgress?.completionPercentage || 0
                };
            })
        });
    } catch (error) {
        console.error('Dashboard API Error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// Helper functions for calculating achievements progress
async function calculateQuickLearnerProgress(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayQuizzes = await db.query.quizResults.findMany({
        where: and(
            eq(quizResults.userId, userId),
            eq(quizResults.attemptDate, today)
        )
    });

    return Math.min((todayQuizzes.length / 5) * 100, 100);
}

async function calculatePerfectScoreProgress(userId: number): Promise<number> {
    const perfectScores = await db.query.quizResults.findMany({
        where: and(
            eq(quizResults.userId, userId),
            eq(quizResults.isCorrect, true)
        )
    });

    return perfectScores.length > 0 ? 100 : 0;
}

async function calculateStreakProgress(userId: number): Promise<number> {
    const streak = await calculateCurrentStreak(userId);
    return Math.min((streak / 7) * 100, 100);
}

async function calculateCurrentStreak(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today.getTime());
    
    while (true) {
        const hasQuiz = await db.query.quizResults.findFirst({
            where: and(
                eq(quizResults.userId, userId),
                eq(quizResults.attemptDate, currentDate)
            )
        });
        
        if (!hasQuiz) break;
        
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
} 
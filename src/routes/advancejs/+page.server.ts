import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { quizzes, quizCategories, userProgress } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect, error as svelteError } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
    const userId = locals.user?.id;
    if (!userId) {
        throw redirect(302, '/login');
    }

    // Get Advanced JavaScript category
    const category = await db.query.quizCategories.findFirst({
        where: eq(quizCategories.name, 'Advanced JavaScript')
    });

    if (!category) {
        throw svelteError(404, 'Advanced JavaScript category not found');
    }

    // Get all quizzes for Advanced JavaScript (with challengeType)
    const advJsQuizzesData = await db.query.quizzes.findMany({
        where: eq(quizzes.quizCategoryId, category.id),
        with: {
            challengeType: true
        }
    });
    console.log('Fetched Advanced JS Quizzes:', advJsQuizzesData);

    // Get user progress for Advanced JavaScript
    // const progress = await db.query.userProgress.findFirst({
    //     where: and(
    //         eq(userProgress.userId, userId),
    //         eq(userProgress.quizCategoryId, category.id)
    //     )
    // });
    // console.log('Fetched User Progress:', progress);

    return {
        category: {
            id: category.id,
            name: category.name
        },
        quizzes: advJsQuizzesData,
        // Remove progress data from the return object
        // progress: {
        //     completed: progress?.completedQuizzes || 0,
        //     total: progress?.totalQuizzes || 0,
        //     percentage: progress?.completionPercentage || 0
        // }
    };
}) satisfies PageServerLoad;
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { quizzes, quizCategories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    // Find the JavaScript category
    const jsCategory = await db.query.quizCategories.findFirst({
        where: eq(quizCategories.name, 'JavaScript')
    });
    if (!jsCategory) {
        return { quizzes: [] };
    }

    // Fetch quizzes for the JavaScript category
    const jsQuizzes = await db.query.quizzes.findMany({
        where: eq(quizzes.quizCategoryId, jsCategory.id)
    });

    // Map to only needed fields
    const quizzesList = jsQuizzes.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        explanation: q.explanation,
        difficulty: q.difficulty,
        options: q.options
    }));

    return { quizzes: quizzesList };
}; 
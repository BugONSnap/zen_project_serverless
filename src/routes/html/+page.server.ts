import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { quizzes, quizCategories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    // Find the HTML category
    const htmlCategory = await db.query.quizCategories.findFirst({
        where: eq(quizCategories.name, 'HTML')
    });
    if (!htmlCategory) {
        return { quizzes: [] };
    }

    // Fetch quizzes for the HTML category
    const htmlQuizzes = await db.query.quizzes.findMany({
        where: eq(quizzes.quizCategoryId, htmlCategory.id)
    });

    // Map to only needed fields
    const quizzesList = htmlQuizzes.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        explanation: q.explanation,
        difficulty: q.difficulty,
        options: q.options
    }));

    return { quizzes: quizzesList };
}; 
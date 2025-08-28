import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/index'; // Using $lib alias for consistency
import { quizzes, quizCategories, challengeTypes, quizResults } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

// Load quizzes and related data
export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.adminLevel > 1) {
    throw redirect(302, '/login');
  }

  const quizList = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      points: quizzes.points,
      difficulty: quizzes.difficulty,
      answer: quizzes.answer,           // <-- Added
      explanation: quizzes.explanation, // <-- Added
      timeLimit: quizzes.timeLimit,     // <-- Added
      options: quizzes.options,         // <-- Added
      categoryName: quizCategories.name,
      challengeTypeName: challengeTypes.name,
    })
    .from(quizzes)
    .leftJoin(quizCategories, eq(quizzes.quizCategoryId, quizCategories.id))
    .leftJoin(challengeTypes, eq(quizzes.challengeTypeId, challengeTypes.id));

  const categories = await db.select({ id: quizCategories.id, name: quizCategories.name }).from(quizCategories);
  const challengeTypesList = await db.select({ id: challengeTypes.id, name: challengeTypes.name }).from(challengeTypes);

  return {
    quizzes: quizList,
    categories: categories ?? [],
    challengeTypes: challengeTypesList ?? [],
  };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    if (!locals.user || locals.user.adminLevel > 1) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const points = parseInt(formData.get('points')?.toString() || '0');
    const answer = formData.get('answer')?.toString();
    const explanation = formData.get('explanation')?.toString();
    const difficulty = formData.get('difficulty')?.toString() || 'MEDIUM';
    const timeLimit = formData.get('timeLimit') ? parseInt(formData.get('timeLimit')?.toString() || '0') : null;
    const options = formData.get('options')?.toString();
    const quizCategoryId = parseInt(formData.get('quizCategoryId')?.toString() || '0');
    const challengeTypeId = parseInt(formData.get('challengeTypeId')?.toString() || '0');

    if (!title || !points || !answer || !quizCategoryId || !challengeTypeId) {
      return fail(400, { error: 'Missing required fields' });
    }

    try {
      let parsedOptions = null;
      if (options) {
        parsedOptions = JSON.parse(options);
        if (typeof parsedOptions !== 'object' || parsedOptions === null) {
          throw new Error('Invalid JSON format for options');
        }
      }

      await db.insert(quizzes).values({
        title,
        description,
        points,
        answer,
        explanation,
        difficulty,
        timeLimit,
        options: parsedOptions,
        quizCategoryId,
        challengeTypeId,
      });

      return { success: true, message: 'Quiz created successfully' };
    } catch (error) {
      return fail(500, { error: 'Failed to create quiz: ' + (error instanceof Error ? error.message : 'Unknown error') });
    }
  },

  update: async ({ request, locals }) => {
    if (!locals.user || locals.user.adminLevel > 1) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const id = parseInt(formData.get('id')?.toString() || '0');
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const points = parseInt(formData.get('points')?.toString() || '0');
    const answer = formData.get('answer')?.toString();
    const explanation = formData.get('explanation')?.toString();
    const difficulty = formData.get('difficulty')?.toString() || 'MEDIUM';
    const timeLimit = formData.get('timeLimit') ? parseInt(formData.get('timeLimit')?.toString() || '0') : null;
    const options = formData.get('options')?.toString();
    const quizCategoryId = parseInt(formData.get('quizCategoryId')?.toString() || '0');
    const challengeTypeId = parseInt(formData.get('challengeTypeId')?.toString() || '0');

    if (!id || !title || !points || !answer || !quizCategoryId || !challengeTypeId) {
      return fail(400, { error: 'Missing required fields or invalid ID' });
    }

    try {
      let parsedOptions = null;
      if (options) {
        parsedOptions = JSON.parse(options);
        if (typeof parsedOptions !== 'object' || parsedOptions === null) {
          throw new Error('Invalid JSON format for options');
        }
      }

      await db
        .update(quizzes)
        .set({
          title,
          description,
          points,
          answer,
          explanation,
          difficulty,
          timeLimit,
          options: parsedOptions,
          quizCategoryId,
          challengeTypeId,
        })
        .where(eq(quizzes.id, id));

      return { success: true, message: 'Quiz updated successfully' };
    } catch (error) {
      return fail(500, { error: 'Failed to update quiz: ' + (error instanceof Error ? error.message : 'Unknown error') });
    }
  },

  delete: async ({ request, locals }) => {
    if (!locals.user || locals.user.adminLevel > 1) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    const quizId = parseInt(formData.get('quizId')?.toString() || '0');

    if (!quizId) {
      return fail(400, { error: 'Invalid quiz ID' });
    }

    try {
      const results = await db
        .select()
        .from(quizResults)
        .where(eq(quizResults.quizId, quizId))
        .limit(1);

      if (results.length > 0) {
        return fail(400, { error: 'Cannot delete quiz with existing results' });
      }

      await db.delete(quizzes).where(eq(quizzes.id, quizId));
      return { success: true, message: 'Quiz deleted successfully' };
    } catch (error) {
      return fail(500, { error: 'Failed to delete quiz: ' + (error instanceof Error ? error.message : 'Unknown error') });
    }
  },
};
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, quizResults, userProgress } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ locals }) => {
    // Check if user is authenticated
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Delete user's quiz results first
        await db.delete(quizResults)
            .where(eq(quizResults.userId, locals.user.id));

        // Delete user's progress
        await db.delete(userProgress)
            .where(eq(userProgress.userId, locals.user.id));

        // Finally, delete the user
        await db.delete(users)
            .where(eq(users.id, locals.user.id));

        // Clear the session by invalidating the auth cookie
        return json(
            { success: true },
            {
                status: 200,
                headers: {
                    'Set-Cookie': 'session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
                }
            }
        );
    } catch (error) {
        console.error('Error deleting profile:', error);
        return json({ error: 'Failed to delete profile' }, { status: 500 });
    }
}; 
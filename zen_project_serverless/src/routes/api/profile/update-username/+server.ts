import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
    // Check if user is authenticated
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { username } = await request.json();

        // Validate username
        if (!username || typeof username !== 'string' || username.length < 3 || username.length > 20) {
            return json({ error: 'Username must be between 3 and 20 characters' }, { status: 400 });
        }

        // Check if username is already taken
        const existingUser = await db.query.users.findFirst({
            where: eq(users.username, username)
        });

        if (existingUser && existingUser.id !== locals.user.id) {
            return json({ error: 'Username is already taken' }, { status: 400 });
        }

        // Update username
        const updatedUser = await db.update(users)
            .set({ username })
            .where(eq(users.id, locals.user.id))
            .returning({
                id: users.id,
                username: users.username,
                email: users.email,
                totalPoints: users.totalPoints,
                createdAt: users.createdAt
            });

        if (!updatedUser[0]) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        return json({ user: updatedUser[0] });
    } catch (error) {
        console.error('Error updating username:', error);
        return json({ error: 'Failed to update username' }, { status: 500 });
    }
}; 
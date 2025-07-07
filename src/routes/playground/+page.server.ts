import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    const userId = locals.user?.id;

    let user = null;
    if (userId) {
        user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });
    }

    return {
        user: user ? { id: user.id, username: user.username, email: user.email } : null
    };
}; 
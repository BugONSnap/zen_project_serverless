import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const handle = async ({ event, resolve }) => {
    const session = event.cookies.get('session');

    if (session) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, parseInt(session, 10))
        });
        if (user) {
            event.locals.user = { // Explicitly define the structure of locals.user
                id: user.id,
                username: user.username,
                email: user.email
            };
        }
    }

    const response = await resolve(event);
    return response;
}; 
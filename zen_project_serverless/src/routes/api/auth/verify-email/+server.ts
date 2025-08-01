import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
    try {
        const { email } = await request.json();

        // Validate input
        if (!email) {
            return json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if user exists
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!user) {
            return json({ error: 'No account found with this email' }, { status: 404 });
        }

        // Return success without exposing sensitive information
        return json({ message: 'Email verified' });

    } catch (error) {
        console.error('Email verification error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
} 
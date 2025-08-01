import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import bcrypt from 'bcryptjs';

export async function POST({ request }) {
    try {
        const { username, email, password, uniqueInfo } = await request.json();

        // Validate input
        if (!username || !email || !password || !uniqueInfo) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: (users, { or, eq }) => or(
                eq(users.email, email),
                eq(users.username, username)
            )
        });

        if (existingUser) {
            return json({ error: 'Username or email already exists' }, { status: 400 });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const [newUser] = await db.insert(users).values({
            username,
            email,
            passwordHash,
            uniqueInfo,
            totalPoints: 0,
            rankId: 1  // Set to Beginner rank
        }).returning();

        return json({
            message: 'Registration successful',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
} 
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
    try {
        const { email, uniqueInfo, newPassword } = await request.json();

        // Validate input
        if (!email || !uniqueInfo || !newPassword) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find user by email
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!user) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        // Verify unique recovery information
        if (user.uniqueInfo !== uniqueInfo) {
            return json({ error: 'Invalid recovery information' }, { status: 400 });
        }

        // Validate password strength
        const passwordPattern = {
            minLength: 8,
            hasUpperCase: /[A-Z]/,
            hasLowerCase: /[a-z]/,
            hasNumber: /[0-9]/,
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
        };

        let passwordStrength = 0;
        if (passwordPattern.hasUpperCase.test(newPassword)) passwordStrength++;
        if (passwordPattern.hasLowerCase.test(newPassword)) passwordStrength++;
        if (passwordPattern.hasNumber.test(newPassword)) passwordStrength++;
        if (passwordPattern.hasSpecialChar.test(newPassword)) passwordStrength++;

        if (newPassword.length < passwordPattern.minLength || passwordStrength < 3) {
            return json({ 
                error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character' 
            }, { status: 400 });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update user's password
        await db.update(users)
            .set({ passwordHash })
            .where(eq(users.id, user.id));

        return json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Password reset error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
} 
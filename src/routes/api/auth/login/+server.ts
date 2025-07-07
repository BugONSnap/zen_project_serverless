import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import CryptoJS from 'crypto-js';

export async function POST({ request, cookies }) {
    try {
        const { email: encryptedEmail, password: encryptedPassword } = await request.json();

        // Define the same secret key as on the client
        const secretKey = 'your-secret-key'; // WARNING: Insecure for production!

        // Decrypt the email and password
        const decryptedEmailBytes = CryptoJS.AES.decrypt(encryptedEmail, secretKey);
        const email = decryptedEmailBytes.toString(CryptoJS.enc.Utf8);

        const decryptedPasswordBytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
        const password = decryptedPasswordBytes.toString(CryptoJS.enc.Utf8);

        // Validate input
        if (!email || !password) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find user by email
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!user) {
            return json({ error: 'Invalid credentials' }, { status: 400 });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return json({ error: 'Invalid credentials' }, { status: 400 });
        }

        // Set session cookie
        cookies.set('session', user.id.toString(), {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        return json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
} 
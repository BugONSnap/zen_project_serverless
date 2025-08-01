import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
    cookies.delete('session', { path: '/' });
    cookies.delete('auth', { path: '/' });
    cookies.delete('user', { path: '/' });
    cookies.delete('isAdmin', { path: '/' });
    return json({ success: true });
} 
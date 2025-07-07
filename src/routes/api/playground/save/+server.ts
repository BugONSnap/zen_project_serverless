import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { codeSnippets } from '$lib/server/db/schema';

export async function POST({ request, cookies }) {
    try {
        const { htmlCode, cssCode, jsCode, title } = await request.json();
        const userId = cookies.get('userId');

        if (!userId) {
            return json({ error: 'User not authenticated' }, { status: 401 });
        }

        if (!htmlCode && !cssCode && !jsCode) {
            return json({ error: 'At least one code section is required' }, { status: 400 });
        }

        const [snippet] = await db.insert(codeSnippets).values({
            userId: parseInt(userId),
            title: title || 'Untitled Snippet',
            htmlCode: htmlCode || '',
            cssCode: cssCode || '',
            jsCode: jsCode || '',
            createdAt: new Date()
        }).returning();

        return json({
            message: 'Snippet saved successfully',
            snippet: {
                id: snippet.id,
                title: snippet.title,
                createdAt: snippet.createdAt
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Save snippet error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
} 
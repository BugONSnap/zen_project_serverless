import { db } from '$lib/server/db';
import { users, quizzes, quizCategories, challengeTypes, userProgress, userRankings, quizResults } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
    // Simple admin check using a cookie
    const isAdmin = cookies.get('isAdmin') === 'true';
    if (!isAdmin) {
        throw redirect(302, '/');
    }

    try {
        // Fetch all data from each table
        const [
            usersData,
            quizzesData,
            categoriesData,
            challengeTypesData,
            progressData,
            rankingsData,
            resultsData
        ] = await Promise.all([
            db.select().from(users),
            db.select().from(quizzes),
            db.select().from(quizCategories),
            db.select().from(challengeTypes),
            db.select().from(userProgress),
            db.select().from(userRankings),
            db.select().from(quizResults)
        ]);

        return {
            tables: {
                users: usersData,
                quizzes: quizzesData,
                categories: categoriesData,
                challengeTypes: challengeTypesData,
                progress: progressData,
                rankings: rankingsData,
                results: resultsData
            }
        };
    } catch (e) {
        console.error('Error fetching admin data:', e);
        throw error(500, 'Failed to fetch admin data');
    }
} 
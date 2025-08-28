import type { PageServerLoad } from './$types';
import { db } from '$lib/server/index';
import { users, userProgress, quizCategories } from '$lib/server/db/schema';
import { sql, eq, inArray } from 'drizzle-orm';

// Explicit type for frontend data
interface AnalyticsData {
  totalUsers: number;
  usersWithProgress: number;
  sectionCounts: Record<string, number>;
  error?: string;
}

const REQUIRED_SECTIONS = ['HTML', 'CSS', 'JS', 'Advanced JS'];

export const load = (async (): Promise<AnalyticsData> => {
  try {
    // Total users
    const [{ count: totalUsers }] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);

    // Users with progress (distinct user IDs in userProgress)
    const [{ count: usersWithProgress }] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${userProgress.userId})` })
      .from(userProgress);

    // Get all quiz categories
    const categories = await db
      .select({ id: quizCategories.id, name: quizCategories.name })
      .from(quizCategories);

    // Map section names to category IDs
    const sectionNameToId: Record<string, number> = {};
    for (const category of categories) {
      if (REQUIRED_SECTIONS.includes(category.name)) {
        sectionNameToId[category.name] = category.id;
      }
    }

    // Section progress counts
    const sectionCounts: Record<string, number> = {};
    for (const section of REQUIRED_SECTIONS) {
      const categoryId = sectionNameToId[section];
      if (categoryId) {
        const [{ count }] = await db
          .select({ count: sql<number>`COUNT(DISTINCT ${userProgress.userId})` })
          .from(userProgress)
          .where(eq(userProgress.quizCategoryId, categoryId));
        sectionCounts[section] = Number(count);
      } else {
        sectionCounts[section] = 0;
      }
    }

    return {
      totalUsers: Number(totalUsers),
      usersWithProgress: Number(usersWithProgress),
      sectionCounts,
    };
  } catch (error) {
    console.error('Analytics load error:', error);
    return {
      totalUsers: 0,
      usersWithProgress: 0,
      sectionCounts: Object.fromEntries(REQUIRED_SECTIONS.map(s => [s, 0])),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}) satisfies PageServerLoad;
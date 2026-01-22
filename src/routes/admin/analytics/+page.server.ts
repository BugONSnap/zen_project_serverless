import type { PageServerLoad } from './$types';
import { db } from '$lib/server/index';
import { users, userProgress, quizCategories, community, communityLikes, communityReplies, communityReplyLikes, userTypes, quizResults } from '$lib/server/db/schema';
import { sql, eq, inArray, gte } from 'drizzle-orm';

// Explicit type for frontend data
interface AnalyticsData {
  totalUsers: number;
  usersWithProgress: number;
  sectionCounts: Record<string, number>;
  // Community metrics
  communityStats: {
    totalPosts: number;
    totalLikes: number;
    totalReplies: number;
    totalReplyLikes: number;
    uniquePosters: number;
    totalEngagement: number;
  };
  // User type breakdown
  userTypeStats: {
    STUDENT: { total: number; withProgress: number; withCommunity: number };
    PROFESSIONAL: { total: number; withProgress: number; withCommunity: number };
    HOBBYIST: { total: number; withProgress: number; withCommunity: number };
  };
  // Engagement by user type
  engagementByType: {
    STUDENT: { posts: number; likes: number; replies: number };
    PROFESSIONAL: { posts: number; likes: number; replies: number };
    HOBBYIST: { posts: number; likes: number; replies: number };
  };
  // Quiz activity
  quizStats: {
    totalAttempts: number;
    totalQuizzes: number;
    averageScore: number;
  };
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

    // Community Statistics
    const [totalPosts] = await db.select({ count: sql<number>`COUNT(*)` }).from(community);
    const [totalLikes] = await db.select({ count: sql<number>`COUNT(*)` }).from(communityLikes);
    const [totalReplies] = await db.select({ count: sql<number>`COUNT(*)` }).from(communityReplies);
    const [totalReplyLikes] = await db.select({ count: sql<number>`COUNT(*)` }).from(communityReplyLikes);
    const [uniquePosters] = await db.select({ count: sql<number>`COUNT(DISTINCT ${community.userId})` }).from(community);
    
    const communityStats = {
      totalPosts: Number(totalPosts?.count || 0),
      totalLikes: Number(totalLikes?.count || 0),
      totalReplies: Number(totalReplies?.count || 0),
      totalReplyLikes: Number(totalReplyLikes?.count || 0),
      uniquePosters: Number(uniquePosters?.count || 0),
      totalEngagement: Number(totalLikes?.count || 0) + Number(totalReplies?.count || 0) + Number(totalReplyLikes?.count || 0),
    };

    // User Type Statistics
    const userTypeStats = {
      STUDENT: { total: 0, withProgress: 0, withCommunity: 0 },
      PROFESSIONAL: { total: 0, withProgress: 0, withCommunity: 0 },
      HOBBYIST: { total: 0, withProgress: 0, withCommunity: 0 },
    };

    // Get all user types
    const allUserTypes = await db.select().from(userTypes);
    const userTypeMap: Record<number, string> = {};
    for (const ut of allUserTypes) {
      userTypeMap[ut.id] = ut.name.toUpperCase();
    }

    // Count users by type
    const usersByType = await db
      .select({
        userTypeId: users.userTypeId,
        count: sql<number>`COUNT(*)`,
      })
      .from(users)
      .groupBy(users.userTypeId);

    for (const item of usersByType) {
      const typeName = userTypeMap[item.userTypeId] as keyof typeof userTypeStats;
      if (typeName && typeName in userTypeStats) {
        userTypeStats[typeName].total = Number(item.count);
      }
    }

    // Count users with progress by type
    const usersWithProgressByType = await db
      .select({
        userTypeId: users.userTypeId,
        count: sql<number>`COUNT(DISTINCT ${userProgress.userId})`,
      })
      .from(userProgress)
      .innerJoin(users, eq(userProgress.userId, users.id))
      .groupBy(users.userTypeId);

    for (const item of usersWithProgressByType) {
      const typeName = userTypeMap[item.userTypeId] as keyof typeof userTypeStats;
      if (typeName && typeName in userTypeStats) {
        userTypeStats[typeName].withProgress = Number(item.count);
      }
    }

    // Count users with community activity by type
    const usersWithCommunityByType = await db
      .select({
        userTypeId: users.userTypeId,
        count: sql<number>`COUNT(DISTINCT ${community.userId})`,
      })
      .from(community)
      .innerJoin(users, eq(community.userId, users.id))
      .groupBy(users.userTypeId);

    for (const item of usersWithCommunityByType) {
      const typeName = userTypeMap[item.userTypeId] as keyof typeof userTypeStats;
      if (typeName && typeName in userTypeStats) {
        userTypeStats[typeName].withCommunity = Number(item.count);
      }
    }

    // Engagement by User Type
    const engagementByType = {
      STUDENT: { posts: 0, likes: 0, replies: 0 },
      PROFESSIONAL: { posts: 0, likes: 0, replies: 0 },
      HOBBYIST: { posts: 0, likes: 0, replies: 0 },
    };

    // Posts by type
    const postsByType = await db
      .select({
        userTypeId: users.userTypeId,
        count: sql<number>`COUNT(*)`,
      })
      .from(community)
      .innerJoin(users, eq(community.userId, users.id))
      .groupBy(users.userTypeId);

    for (const item of postsByType) {
      const typeName = userTypeMap[item.userTypeId] as keyof typeof engagementByType;
      if (typeName && typeName in engagementByType) {
        engagementByType[typeName].posts = Number(item.count);
      }
    }

    // Likes by type
    const likesByType = await db
      .select({
        userTypeId: users.userTypeId,
        count: sql<number>`COUNT(*)`,
      })
      .from(communityLikes)
      .innerJoin(users, eq(communityLikes.userId, users.id))
      .groupBy(users.userTypeId);

    for (const item of likesByType) {
      const typeName = userTypeMap[item.userTypeId] as keyof typeof engagementByType;
      if (typeName && typeName in engagementByType) {
        engagementByType[typeName].likes = Number(item.count);
      }
    }

    // Replies by type
    const repliesByType = await db
      .select({
        userTypeId: users.userTypeId,
        count: sql<number>`COUNT(*)`,
      })
      .from(communityReplies)
      .innerJoin(users, eq(communityReplies.userId, users.id))
      .groupBy(users.userTypeId);

    for (const item of repliesByType) {
      const typeName = userTypeMap[item.userTypeId] as keyof typeof engagementByType;
      if (typeName && typeName in engagementByType) {
        engagementByType[typeName].replies = Number(item.count);
      }
    }

    // Quiz Statistics
    const [totalQuizAttempts] = await db.select({ count: sql<number>`COUNT(*)` }).from(quizResults);
    const [totalQuizzes] = await db.select({ count: sql<number>`COUNT(*)` }).from(quizCategories);
    
    // Calculate average score (points earned / total attempts)
    const [avgScoreResult] = await db
      .select({ avg: sql<number>`COALESCE(AVG(${quizResults.pointsEarned}), 0)` })
      .from(quizResults);

    const quizStats = {
      totalAttempts: Number(totalQuizAttempts?.count || 0),
      totalQuizzes: Number(totalQuizzes?.count || 0),
      averageScore: Number(avgScoreResult?.avg || 0),
    };

    return {
      totalUsers: Number(totalUsers),
      usersWithProgress: Number(usersWithProgress),
      sectionCounts,
      communityStats,
      userTypeStats,
      engagementByType,
      quizStats,
    };
  } catch (error) {
    console.error('Analytics load error:', error);
    return {
      totalUsers: 0,
      usersWithProgress: 0,
      sectionCounts: Object.fromEntries(REQUIRED_SECTIONS.map(s => [s, 0])),
      communityStats: {
        totalPosts: 0,
        totalLikes: 0,
        totalReplies: 0,
        totalReplyLikes: 0,
        uniquePosters: 0,
        totalEngagement: 0,
      },
      userTypeStats: {
        STUDENT: { total: 0, withProgress: 0, withCommunity: 0 },
        PROFESSIONAL: { total: 0, withProgress: 0, withCommunity: 0 },
        HOBBYIST: { total: 0, withProgress: 0, withCommunity: 0 },
      },
      engagementByType: {
        STUDENT: { posts: 0, likes: 0, replies: 0 },
        PROFESSIONAL: { posts: 0, likes: 0, replies: 0 },
        HOBBYIST: { posts: 0, likes: 0, replies: 0 },
      },
      quizStats: {
        totalAttempts: 0,
        totalQuizzes: 0,
        averageScore: 0,
      },
      error: error instanceof Error ? error.message : String(error),
    };
  }
}) satisfies PageServerLoad;
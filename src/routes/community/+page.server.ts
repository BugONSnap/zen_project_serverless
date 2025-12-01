import { db } from "$lib/server";
import { community, users, userTypes, communityLikes, communityReplies } from "$lib/server/db/schema";
import { desc, eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  // Fetch all community posts with user, userType, likes, and replies
  const posts = await db.query.community.findMany({
    orderBy: desc(community.createdAt),
    with: {
      user: {
        with: {
          userType: true,
        },
      },
      likes: {
        with: {
          user: true,
        },
      },
      replies: {
        with: {
          user: true,
        },
      },
    },
  });
  let user = null;
  if (locals.user?.id) {
    user = await db.query.users.findFirst({
      where: eq(users.id, locals.user.id),
      with: { userType: true },
    });
  }
  return { posts, user };
};

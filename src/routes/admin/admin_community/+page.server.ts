import { db } from "$lib/server";
import { community } from "$lib/server/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const posts = await db.query.community.findMany({
    where: and(
      eq(community.isHidden, false),
      sql`${community.deletedAt} IS NULL`
    ),
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
          likes: {
            with: {
              user: true,
            },
          },
        },
      },
    },
  });
  return { posts };
};

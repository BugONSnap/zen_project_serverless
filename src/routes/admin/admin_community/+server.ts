import { json } from "@sveltejs/kit";
import { db } from "$lib/server";
import { community, users, communityLikes, communityReplies, communityReplyLikes } from "$lib/server/db/schema";
import { desc, eq, sql, and } from "drizzle-orm";

export async function GET() {
  // Fetch all visible community posts (not hidden, not deleted) with user, userType, likes, and replies
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
  return json({ posts });
}

// Admin delete post by postId
export async function DELETE({ request }) {
  const { postId } = await request.json();
  if (!postId) return json({ error: "Invalid input" }, { status: 400 });

  // Delete reply likes for all replies to this post
  const replies = await db.select({ id: communityReplies.id }).from(communityReplies).where(eq(communityReplies.postId, postId));
  const replyIds = replies.map(r => r.id);
  if (replyIds.length > 0) {
    await db.delete(communityReplyLikes).where(sql`${communityReplyLikes.replyId} = ANY(${replyIds})`);
  }

  // Delete likes and replies first to avoid foreign key constraint issues
  await db.delete(communityLikes).where(eq(communityLikes.postId, postId));
  await db.delete(communityReplies).where(eq(communityReplies.postId, postId));
  await db.delete(community).where(eq(community.id, postId));
  return json({ success: true });
}

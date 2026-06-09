import { json } from "@sveltejs/kit";
import { db } from "$lib/server";
import { community, communityLikes, communityReplies, communityReplyLikes } from "$lib/server/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function GET() {
  const posts = await db.query.community.findMany({
    where: sql`${community.deletedAt} IS NULL`,
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

export async function PATCH({ request }) {
  const { postId, isHidden } = await request.json();
  if (!postId || typeof isHidden !== "boolean") {
    return json({ error: "Invalid input" }, { status: 400 });
  }

  const [updated] = await db
    .update(community)
    .set({ isHidden })
    .where(eq(community.id, postId))
    .returning();

  if (!updated) return json({ error: "Post not found" }, { status: 404 });
  return json({ post: updated });
}

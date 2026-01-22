import { json } from "@sveltejs/kit";
import { db } from "$lib/server";
import { community, communityLikes, communityReplies, communityReplyLikes, users } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST({ request, locals }) {
  const userId = locals.user?.id;
  if (!userId) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is blocked from posting
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (user?.isBlockedFromPosting) {
    return json({ error: "You have been blocked from posting in the community" }, { status: 403 });
  }

  const { content, rating } = await request.json();
  if (!content || typeof rating !== "number" || rating < 1 || rating > 5) {
    return json({ error: "Invalid input" }, { status: 400 });
  }
  const [newPost] = await db.insert(community).values({
    userId,
    content,
    rating,
    createdAt: new Date(),
  }).returning();
  
  // Fetch the post with user data
  const postWithUser = await db.query.community.findFirst({
    where: eq(community.id, newPost.id),
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
  
  return json({ post: postWithUser || newPost });
}


// Reply to a post or comment
export async function PUT({ request, locals }) {
  const userId = locals.user?.id;
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });
  const { postId, content, parentReplyId } = await request.json();
  if (!postId || !content) return json({ error: "Invalid input" }, { status: 400 });
  
  // For now, parentReplyId is accepted but not stored (schema doesn't support it yet)
  // In the future, we can add parentReplyId to the schema for nested replies
  const [reply] = await db.insert(communityReplies)
    .values({ postId, userId, content, createdAt: new Date() })
    .returning();
  
  // Fetch the reply with user data
  const replyWithUser = await db.query.communityReplies.findFirst({
    where: eq(communityReplies.id, reply.id),
    with: {
      user: true,
    },
  });
  
  return json({ reply: replyWithUser || reply });
}

// Delete a post or reply
export async function DELETE({ request, locals }) {
  const userId = locals.user?.id;
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });
  const { postId, replyId } = await request.json();
  
  // Handle reply deletion
  if (replyId) {
    if (!replyId) return json({ error: "Invalid input" }, { status: 400 });
    const reply = await db.query.communityReplies.findFirst({ where: eq(communityReplies.id, replyId) });
    if (!reply) return json({ error: "Reply not found" }, { status: 404 });
    // Only allow deleting own reply (or admin)
    if (reply.userId !== userId) {
      const adminLevel = locals.user?.adminLevel ?? 2;
      if (adminLevel > 1) {
        return json({ error: "Forbidden" }, { status: 403 });
      }
    }
    await db.delete(communityReplies).where(eq(communityReplies.id, replyId));
    return json({ success: true });
  }
  
  // Handle post deletion
  if (!postId) return json({ error: "Invalid input" }, { status: 400 });
  const post = await db.query.community.findFirst({ where: eq(community.id, postId) });
  if (!post) return json({ error: "Post not found" }, { status: 404 });
  // Allow superadmin (0) and admin (1) to delete any post
  if (post.userId !== userId) {
    const adminLevel = locals.user?.adminLevel ?? 2;
    if (adminLevel > 1) {
      return json({ error: "Forbidden" }, { status: 403 });
    }
  }
  // Delete likes and replies first to avoid foreign key constraint issues
  await db.delete(communityLikes).where(eq(communityLikes.postId, postId));
  await db.delete(communityReplies).where(eq(communityReplies.postId, postId));
  await db.delete(community).where(eq(community.id, postId));
  return json({ success: true });
}

// Edit a post or reply, or handle like/dislike
export async function PATCH({ request, locals }) {
  const userId = locals.user?.id;
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });
  const { postId, replyId, content, rating, isLike } = await request.json();
  
  // PATCH is used for both like/dislike and editing content
  if (typeof isLike === "boolean") {
    // Handle reply likes
    if (replyId) {
      if (!replyId || typeof isLike !== "boolean") return json({ error: "Invalid input" }, { status: 400 });
      const existing = await db.query.communityReplyLikes.findFirst({
        where: and(eq(communityReplyLikes.replyId, replyId), eq(communityReplyLikes.userId, userId)),
      });
      let like;
      if (existing) {
        if (existing.isLike === isLike) {
          await db.delete(communityReplyLikes).where(eq(communityReplyLikes.id, existing.id));
          like = null;
        } else {
          [like] = await db.update(communityReplyLikes)
            .set({ isLike })
            .where(eq(communityReplyLikes.id, existing.id))
            .returning();
        }
      } else {
        [like] = await db.insert(communityReplyLikes)
          .values({ replyId, userId, isLike, createdAt: new Date() })
          .returning();
      }
      return json({ like });
    }
    
    // Handle post likes
    if (!postId || typeof isLike !== "boolean") return json({ error: "Invalid input" }, { status: 400 });
    const existing = await db.query.communityLikes.findFirst({
      where: and(eq(communityLikes.postId, postId), eq(communityLikes.userId, userId)),
    });
    let like;
    if (existing) {
      if (existing.isLike === isLike) {
        await db.delete(communityLikes).where(eq(communityLikes.id, existing.id));
        like = null;
      } else {
        [like] = await db.update(communityLikes)
          .set({ isLike })
          .where(eq(communityLikes.id, existing.id))
          .returning();
      }
    } else {
      [like] = await db.insert(communityLikes)
        .values({ postId, userId, isLike, createdAt: new Date() })
        .returning();
    }
    return json({ like });
  }
  
  // Edit reply
  if (replyId) {
    if (!replyId || !content) return json({ error: "Invalid input" }, { status: 400 });
    const reply = await db.query.communityReplies.findFirst({ where: eq(communityReplies.id, replyId) });
    if (!reply) return json({ error: "Reply not found" }, { status: 404 });
    // Only allow editing own reply (or admin)
    if (reply.userId !== userId && (locals.user?.adminLevel ?? 2) > 1) {
      return json({ error: "Forbidden" }, { status: 403 });
    }
    const [updated] = await db.update(communityReplies)
      .set({ content })
      .where(eq(communityReplies.id, replyId))
      .returning();
    
    // Fetch the reply with user data
    const replyWithUser = await db.query.communityReplies.findFirst({
      where: eq(communityReplies.id, updated.id),
      with: {
        user: true,
      },
    });
    
    return json({ reply: replyWithUser || updated });
  }
  
  // Edit post content
  if (!postId || !content || typeof rating !== "number") return json({ error: "Invalid input" }, { status: 400 });
  const post = await db.query.community.findFirst({ where: eq(community.id, postId) });
  if (!post) return json({ error: "Post not found" }, { status: 404 });
  if (post.userId !== userId && (locals.user?.adminLevel ?? 2) > 1) {
    return json({ error: "Forbidden" }, { status: 403 });
  }
  const [updated] = await db.update(community)
    .set({ content, rating })
    .where(eq(community.id, postId))
    .returning();
  return json({ post: updated });
}

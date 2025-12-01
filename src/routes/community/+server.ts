import { json } from "@sveltejs/kit";
import { db } from "$lib/server";
import { community, communityLikes, communityReplies } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST({ request, locals }) {
  const userId = locals.user?.id;
  if (!userId) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const { content, rating } = await request.json();
  if (!content || typeof rating !== "number" || rating < 1 || rating > 5) {
    return json({ error: "Invalid input" }, { status: 400 });
  }
  const post = await db.insert(community).values({
    userId,
    content,
    rating,
    createdAt: new Date(),
  }).returning();
  return json({ post: post[0] });
}


// Reply to a post
export async function PUT({ request, locals }) {
  const userId = locals.user?.id;
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });
  const { postId, content } = await request.json();
  if (!postId || !content) return json({ error: "Invalid input" }, { status: 400 });
  const [reply] = await db.insert(communityReplies)
    .values({ postId, userId, content, createdAt: new Date() })
    .returning();
  return json({ reply });
}

// Delete a post
export async function DELETE({ request, locals }) {
  const userId = locals.user?.id;
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });
  const { postId } = await request.json();
  if (!postId) return json({ error: "Invalid input" }, { status: 400 });
  // Only allow deleting own post (or admin)
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

// Edit a post
export async function PATCH({ request, locals }) {
  const userId = locals.user?.id;
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });
  const { postId, content, rating, isLike } = await request.json();
  // PATCH is used for both like/dislike and editing content
  if (typeof isLike === "boolean") {
    // Like/dislike logic (fixed: use already destructured isLike)
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
  // Edit content
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

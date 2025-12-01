<script lang="ts">
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    // SvelteKit 1+ expects export let data
    export let data: { posts: any[], user?: any };
    let content = '';
    let rating = 5;
    let submitting = false;
    let error = '';
    let posts = data?.posts ?? [];
    let replyContent: Record<number, string> = {};
    let replySubmitting: Record<number, boolean> = {};
    let likeLoading: Record<number, boolean> = {};

    // Edit/delete logic
    let editingPost: any = null;
    let editContent = '';
    let editRating = 5;
    let editError = '';
    let editSubmitting = false;

    function startEdit(post: any) {
        editingPost = { ...post };
        editContent = post.content;
        editRating = post.rating;
        editError = '';
    }

    async function saveEdit() : Promise<void> {
        if (!editingPost) return;
        editSubmitting = true;
        editError = '';
        try {
            const res = await fetch('', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: editingPost.id, content: editContent, rating: Number(editRating) })
            });
            const result = await res.json();
            if (res.ok) {
                posts = posts.map((post: { id: number, content: string, rating: number }) =>
                    post.id === editingPost.id ? { ...post, content: editContent, rating: editRating } : post
                );
                editingPost = null;
            } else {
                editError = result.error || 'Failed to edit post.';
            }
        } catch (e) {
            editError = 'Network error.';
        } finally {
            editSubmitting = false;
        }
    }

    function cancelEdit() {
        editingPost = null;
        editError = '';
    }

    // Delete confirmation modal logic
    let showDeleteModal = false;
    let deleteTargetPostId: number | null = null;
    let deleteError = '';
    let deleteSubmitting = false;

    function confirmDelete(postId: number) {
        deleteTargetPostId = postId;
        deleteError = '';
        showDeleteModal = true;
    }

    function cancelDelete() {
        showDeleteModal = false;
        deleteTargetPostId = null;
        deleteError = '';
    }

    async function doDeletePost() {
        if (!deleteTargetPostId) return;
        deleteSubmitting = true;
        deleteError = '';
        try {
            const res = await fetch('', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: deleteTargetPostId })
            });
            const result = await res.json();
            if (res.ok) {
                posts = posts.filter((post: any) => post.id !== deleteTargetPostId);
                showDeleteModal = false;
                deleteTargetPostId = null;
            } else {
                deleteError = result.error || 'Failed to delete post.';
            }
        } catch (e) {
            deleteError = 'Network error.';
        } finally {
            deleteSubmitting = false;
        }
    }

    async function submitPost() {
        submitting = true;
        error = '';
        try {
            const res = await fetch('', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, rating: Number(rating) }) // Ensure rating is a number
            });
            const result = await res.json();
            if (res.ok) {
                posts = [result.post, ...posts];
                content = '';
                rating = 5;
            } else {
                error = result.error || 'Failed to post.';
            }
        } catch (e) {
            error = 'Network error.';
        } finally {
            submitting = false;
        }
    }

    function getLikeCount(post: any) {
        return post.likes?.filter((l: any) => l.isLike).length || 0;
    }
    function getDislikeCount(post: any) {
        return post.likes?.filter((l: any) => !l.isLike).length || 0;
    }
    function userLikeStatus(post: any) {
        if (!data.user) return null;
        const like = post.likes?.find((l: any) => l.userId === data.user.id);
        return like ? (like.isLike ? 'like' : 'dislike') : null;
    }

    async function toggleLike(postId: number, isLike: boolean) {
        if (!data.user) return;
        likeLoading[postId] = true;
        try {
            const res = await fetch('', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, isLike })
            });
            const result = await res.json();
            if (res.ok) {
                // Update post likes in local state
                posts = posts.map((post: { id: number, likes: any[] }) => {
                    if (post.id !== postId) return post;
                    let likes = post.likes.filter((l: { userId: number }) => l.userId !== data.user.id);
                    if (result.like) likes = [...likes, result.like];
                    post.likes = likes;
                    return post;
                });
            }
        } finally {
            likeLoading[postId] = false;
        }
    }

    async function submitReply(postId: number) {
        if (!replyContent[postId] || !data.user) return;
        replySubmitting[postId] = true;
        try {
            const res = await fetch('', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId, content: replyContent[postId] })
            });
            const result = await res.json();
            if (res.ok) {
                posts = posts.map((post: { id: number, replies: any[] }) => {
                    if (post.id !== postId) return post;
                    post.replies = [...(post.replies || []), result.reply];
                    return post;
                });
                replyContent[postId] = '';
            }
        } finally {
            replySubmitting[postId] = false;
        }
    }
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Poppins:wght@700&display=swap');
.dashboard-bg {
    font-family: 'Poppins', Arial, sans-serif;
}
.glass-card {
    background: rgba(31, 41, 55, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(31, 41, 55, 0.37);
}
.gold-accent {
    color: #d97706;
}
.like-btn, .dislike-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    margin-right: 0.5rem;
    color: #d97706;
    transition: color 0.2s;
}
.like-btn.active, .dislike-btn.active {
    color: #fbbf24;
}
.reply-section {
    margin-top: 1rem;
    padding-left: 2.5rem;
}
.reply-input {
    background: #23283a;
    border-radius: 0.5rem;
    border: 1px solid #444;
    color: #fff;
    padding: 0.5rem 1rem;
    width: 100%;
    margin-bottom: 0.5rem;
}
.reply-btn {
    background: #d97706;
    color: #fff;
    border: none;
    border-radius: 0.5rem;
    padding: 0.3rem 1.2rem;
    font-weight: bold;
    cursor: pointer;
    margin-left: 0.5rem;
}
.reply-list {
    margin-top: 0.5rem;
}
.reply-item {
    background: #23283a;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    margin-bottom: 0.4rem;
    color: #fff;
    font-size: 0.95rem;
}
.reply-meta {
    font-size: 0.8rem;
    color: #fbbf24;
    margin-bottom: 0.2rem;
}
</style>

<div class="min-h-screen text-white font-medium relative dashboard-bg" style="background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%); font-family: poppins;">
    <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>
    <DashboardHeader title="Community" user={data.user} pageName="Community" />
    <main class="max-w-2xl mx-auto px-4 py-12 space-y-8 relative z-10">
        <section class="glass-card rounded-3xl p-8 shadow-2xl mb-8">
            <h2 class="text-3xl font-bold mb-4 gold-accent">Share your Zentry experience</h2>
            <form on:submit|preventDefault={submitPost} class="space-y-4">
                <textarea class="w-full rounded-xl p-3 bg-gray-900/60 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#d97706]" rows="3" bind:value={content} maxlength="500" placeholder="Write your thoughts about Zentry..." required></textarea>
                <div class="flex items-center gap-4">
                    <label for="rating" class="text-sm gold-accent font-semibold">Rating:</label>
                    <select id="rating" class="rounded-lg bg-gray-900/60 border border-white/10 text-white px-3 py-1" bind:value={rating} required>
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                    </select>
                    <button type="submit" class="ml-auto rounded-full bg-[#d97706] px-6 py-2 text-white font-bold shadow hover:bg-[#b45309] transition-all" disabled={submitting}>{submitting ? 'Posting...' : 'Post'}</button>
                </div>
                {#if error}
                    <div class="text-red-400 text-sm mt-2">{error}</div>
                {/if}
            </form>
        </section>
        <section class="space-y-6">
            <h3 class="text-2xl font-bold mb-2 gold-accent">Community Posts</h3>
            {#if posts.length === 0}
                <div class="glass-card rounded-xl p-6 text-gray-300">No posts yet. Be the first to share your thoughts!</div>
            {:else}
                {#each posts as post}
                    <article class="glass-card rounded-xl p-6 flex flex-col gap-2">
                        <div class="flex items-center gap-3 mb-1">
                            <span class="rounded-full bg-gradient-to-r from-[#d97706] to-[#1e40af] w-10 h-10 flex items-center justify-center text-lg font-bold uppercase">{post.user?.username?.charAt(0) ?? '?'}</span>
                            <div>
                                <div class="font-semibold text-white">{post.user?.username ?? 'Unknown'}</div>
                                <div class="text-xs gold-accent font-semibold uppercase tracking-wider">{post.user?.userType?.name ?? ''}</div>
                            </div>
                            <span class="ml-auto flex items-center gap-1 text-yellow-400 font-bold text-lg">{'★'.repeat(post.rating)}{'☆'.repeat(5 - post.rating)}</span>
                            {#if data.user && (post.userId === data.user.id || (data.user.adminLevel ?? 2) <= 1)}
                                <button class="ml-2 px-2 py-1 bg-blue-700 text-white rounded text-xs" on:click={() => startEdit(post)}>Edit</button>
                                <button class="ml-2 px-2 py-1 bg-red-700 text-white rounded text-xs" on:click={() => confirmDelete(post.id)}>Delete</button>
                            {/if}
                        </div>
                        <div class="flex items-center gap-2 mt-2">
                            <button class="like-btn {userLikeStatus(post) === 'like' ? 'active' : ''}" aria-label="Like" disabled={likeLoading[post.id]} on:click={() => toggleLike(post.id, true)}>
                                👍 {getLikeCount(post)}
                            </button>
                            <button class="dislike-btn {userLikeStatus(post) === 'dislike' ? 'active' : ''}" aria-label="Dislike" disabled={likeLoading[post.id]} on:click={() => toggleLike(post.id, false)}>
                                👎 {getDislikeCount(post)}
                            </button>
                        </div>
                        <div class="text-gray-200 text-base mt-1">{post.content}</div>
                        <div class="text-xs text-gray-400 mt-2">{new Date(post.createdAt).toLocaleString()}</div>
                        <div class="reply-section">
                            <input class="reply-input" type="text" placeholder="Write a reply..." bind:value={replyContent[post.id]} maxlength="250" />
                            <button class="reply-btn" disabled={!replyContent[post.id] || replySubmitting[post.id]} on:click={() => submitReply(post.id)}>
                                {replySubmitting[post.id] ? 'Replying...' : 'Reply'}
                            </button>
                            {#if post.replies && post.replies.length > 0}
                                <div class="reply-list">
                                    {#each post.replies as reply}
                                        <div class="reply-item">
                                            <div class="reply-meta">{reply.user?.username ?? 'User'} • {new Date(reply.createdAt).toLocaleString()}</div>
                                            {reply.content}
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </article>
                {/each}
            {/if}
        </section>
    {#if editingPost}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div class="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <h2 class="text-xl font-bold mb-4 gold-accent">Edit Post</h2>
            <textarea class="w-full rounded-xl p-3 bg-gray-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#d97706] mb-4" rows="3" bind:value={editContent} maxlength="500" required></textarea>
            <div class="flex items-center gap-4 mb-4">
                <label for="editRating" class="text-sm gold-accent font-semibold">Rating:</label>
                <select id="editRating" class="rounded-lg bg-gray-800 border border-white/10 text-white px-3 py-1" bind:value={editRating} required>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                </select>
            </div>
            {#if editError}
                <div class="text-red-400 text-sm mb-2">{editError}</div>
            {/if}
            <div class="flex justify-end gap-2">
                <button class="px-4 py-2 rounded bg-gray-600 text-white" on:click={cancelEdit} disabled={editSubmitting}>Cancel</button>
                <button class="px-4 py-2 rounded bg-[#d97706] text-white font-bold" on:click={saveEdit} disabled={editSubmitting}>{editSubmitting ? 'Saving...' : 'Save'}</button>
            </div>
        </div>
    </div>
{/if}
</main>
{#if showDeleteModal}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div class="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <h2 class="text-xl font-bold mb-4 gold-accent">Delete Post</h2>
        <p class="mb-4">Are you sure you want to delete this post? This action cannot be undone.</p>
        {#if deleteError}
            <div class="text-red-400 text-sm mb-2">{deleteError}</div>
        {/if}
        <div class="flex justify-end gap-2">
            <button class="px-4 py-2 rounded bg-gray-600 text-white" on:click={cancelDelete} disabled={deleteSubmitting}>Cancel</button>
            <button class="px-4 py-2 rounded bg-red-700 text-white font-bold" on:click={doDeletePost} disabled={deleteSubmitting}>{deleteSubmitting ? 'Deleting...' : 'Delete'}</button>
        </div>
    </div>
</div>
{/if}
</div>
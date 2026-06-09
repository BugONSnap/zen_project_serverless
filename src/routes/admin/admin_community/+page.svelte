<script lang="ts">
  import {
    SUBREDDITS,
    getPostSubreddit,
    getSubredditMeta,
    stripSubredditPrefix,
    getPostScore,
    countPostsBySubreddit
  } from '$lib/communityUtils';

  export let data: { posts: any[] };

  let posts = data.posts ?? [];
  let searchQuery = '';
  let activeSubreddit: string | 'all' = 'all';
  let visibilityFilter: 'all' | 'visible' | 'hidden' = 'all';
  let expandedPosts: Set<number> = new Set();

  let showDeleteModal = false;
  let deleteTargetPostId: number | null = null;
  let deleting = false;
  let deleteError = '';
  let actionLoading: Record<number, boolean> = {};

  $: subredditCounts = countPostsBySubreddit(posts);
  $: hiddenCount = posts.filter((p) => p.isHidden).length;
  $: visibleCount = posts.length - hiddenCount;

  $: filteredPosts = posts.filter((post) => {
    if (visibilityFilter === 'visible' && post.isHidden) return false;
    if (visibilityFilter === 'hidden' && !post.isHidden) return false;
    if (activeSubreddit !== 'all' && getPostSubreddit(post) !== activeSubreddit) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const sub = getSubredditMeta(getPostSubreddit(post));
      return (
        stripSubredditPrefix(post.content).toLowerCase().includes(query) ||
        post.user?.username?.toLowerCase().includes(query) ||
        sub.label.toLowerCase().includes(query) ||
        String(post.id).includes(query)
      );
    }
    return true;
  });

  function toggleExpand(postId: number) {
    if (expandedPosts.has(postId)) expandedPosts.delete(postId);
    else expandedPosts.add(postId);
    expandedPosts = expandedPosts;
  }

  function confirmDelete(postId: number) {
    showDeleteModal = true;
    deleteTargetPostId = postId;
    deleteError = '';
  }

  async function deletePost() {
    if (!deleteTargetPostId) return;
    deleting = true;
    deleteError = '';
    try {
      const res = await fetch('/admin/admin_community', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: deleteTargetPostId })
      });
      const result = await res.json();
      if (res.ok) {
        posts = posts.filter((p) => p.id !== deleteTargetPostId);
        showDeleteModal = false;
        deleteTargetPostId = null;
      } else {
        deleteError = result.error || 'Failed to delete post.';
      }
    } catch {
      deleteError = 'Network error.';
    } finally {
      deleting = false;
    }
  }

  async function toggleHidden(post: any) {
    actionLoading[post.id] = true;
    try {
      const res = await fetch('/admin/admin_community', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, isHidden: !post.isHidden })
      });
      const result = await res.json();
      if (res.ok) {
        posts = posts.map((p) => (p.id === post.id ? { ...p, isHidden: result.post.isHidden } : p));
      }
    } finally {
      actionLoading[post.id] = false;
    }
  }
</script>

<section class="space-y-6">
  <div class="rounded-3xl border-2 border-amber-400/30 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-6 md:p-8">
    <div class="text-center space-y-2 mb-6">
      <p class="text-xs uppercase tracking-[0.35em] text-amber-400/70">Administration</p>
      <h1 class="text-3xl font-bold text-amber-400 dashboard-heading">Community Moderation</h1>
      <p class="text-gray-300 text-sm">Manage Reddit-style posts across all r/ communities.</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div class="rounded-xl border border-amber-400/20 bg-gray-800/60 p-4 text-center">
        <p class="text-2xl font-bold text-white">{posts.length}</p>
        <p class="text-xs text-gray-400 uppercase tracking-wide">Total Posts</p>
      </div>
      <div class="rounded-xl border border-emerald-400/20 bg-gray-800/60 p-4 text-center">
        <p class="text-2xl font-bold text-emerald-300">{visibleCount}</p>
        <p class="text-xs text-gray-400 uppercase tracking-wide">Visible</p>
      </div>
      <div class="rounded-xl border border-red-400/20 bg-gray-800/60 p-4 text-center">
        <p class="text-2xl font-bold text-red-300">{hiddenCount}</p>
        <p class="text-xs text-gray-400 uppercase tracking-wide">Hidden</p>
      </div>
      <div class="rounded-xl border border-blue-400/20 bg-gray-800/60 p-4 text-center">
        <p class="text-2xl font-bold text-blue-300">{SUBREDDITS.length}</p>
        <p class="text-xs text-gray-400 uppercase tracking-wide">Communities</p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-4 mb-6">
      <div class="flex-1">
        <input
          type="text"
          class="w-full bg-gray-800/80 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 text-sm"
          placeholder="Search posts, users, r/communities, or post ID..."
          bind:value={searchQuery}
        />
      </div>
      <select
        class="admin-select px-4 py-2.5 text-sm"
        bind:value={visibilityFilter}
      >
        <option value="all">All posts</option>
        <option value="visible">Visible only</option>
        <option value="hidden">Hidden only</option>
      </select>
      <select
        class="admin-select px-4 py-2.5 text-sm"
        bind:value={activeSubreddit}
      >
        <option value="all">All communities</option>
        {#each SUBREDDITS as sub}
          <option value={sub.id}>{sub.icon} {sub.label}</option>
        {/each}
      </select>
    </div>

    <div class="flex flex-wrap gap-2 mb-6">
      {#each subredditCounts as sub}
        <button
          class="text-xs px-3 py-1.5 rounded-full border transition-colors {activeSubreddit === sub.id ? 'bg-amber-400/20 border-amber-400 text-amber-300' : 'border-gray-600 text-gray-400 hover:border-gray-500'}"
          on:click={() => activeSubreddit = activeSubreddit === sub.id ? 'all' : sub.id}
        >
          {sub.icon} {sub.label} ({sub.count})
        </button>
      {/each}
    </div>

    {#if filteredPosts.length === 0}
      <p class="text-gray-500 text-center py-8">No posts match your filters.</p>
    {:else}
      <div class="space-y-3">
        {#each filteredPosts as post (post.id)}
          {@const sub = getSubredditMeta(getPostSubreddit(post))}
          {@const score = getPostScore(post)}
          <article class="rounded-xl border {post.isHidden ? 'border-red-500/40 bg-red-950/20' : 'border-amber-400/20 bg-gray-800/70'} p-4 md:p-5 shadow-lg">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400 mb-2">
              <span class="font-bold text-white">{sub.icon} {sub.label}</span>
              <span>•</span>
              <span>u/{post.user?.username ?? 'Unknown'}</span>
              <span>•</span>
              <span class="px-2 py-0.5 rounded-full bg-gray-700 text-amber-300 text-[10px] font-bold uppercase">
                {post.user?.userType?.name ?? 'MEMBER'}
              </span>
              <span>•</span>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
              {#if post.isHidden}
                <span class="px-2 py-0.5 rounded-full bg-red-900/60 text-red-300 text-[10px] font-bold uppercase">Hidden</span>
              {/if}
              <span class="ml-auto text-[10px] text-gray-500">ID: {post.id}</span>
            </div>

            <p class="text-white text-sm md:text-base leading-relaxed mb-2 whitespace-pre-wrap break-words">
              {stripSubredditPrefix(post.content)}
            </p>

            <div class="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-3">
              <span class="{score > 0 ? 'text-orange-400' : score < 0 ? 'text-blue-400' : ''} font-bold">
                Score: {score}
              </span>
              <span>👍 {post.likes?.filter((l) => l.isLike).length ?? 0}</span>
              <span>👎 {post.likes?.filter((l) => !l.isLike).length ?? 0}</span>
              <span>💬 {post.replies?.length ?? 0} comments</span>
              <span class="text-yellow-500">{'★'.repeat(post.rating)}</span>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                class="text-xs px-3 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-500 transition-colors"
                on:click={() => toggleExpand(post.id)}
              >
                {expandedPosts.has(post.id) ? 'Hide' : 'Show'} comments
              </button>
              <button
                class="text-xs px-3 py-1.5 rounded-lg border {post.isHidden ? 'border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10' : 'border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10'} transition-colors disabled:opacity-50"
                disabled={actionLoading[post.id]}
                on:click={() => toggleHidden(post)}
              >
                {actionLoading[post.id] ? '...' : post.isHidden ? 'Unhide' : 'Hide'}
              </button>
              <button
                class="text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                on:click={() => confirmDelete(post.id)}
              >
                Delete
              </button>
            </div>

            {#if expandedPosts.has(post.id) && post.replies?.length > 0}
              <div class="mt-4 pt-4 border-t border-gray-700/50 space-y-2">
                {#each post.replies as reply}
                  <div class="rounded-lg bg-gray-900/60 border-l-2 border-emerald-500/40 px-3 py-2 text-sm">
                    <div class="text-xs text-gray-500 mb-1">
                      u/{reply.user?.username ?? 'Unknown'} • {new Date(reply.createdAt).toLocaleString()}
                    </div>
                    <p class="text-gray-200">{reply.content}</p>
                  </div>
                {/each}
              </div>
            {:else if expandedPosts.has(post.id)}
              <p class="mt-3 text-xs text-gray-500">No comments on this post.</p>
            {/if}
          </article>
        {/each}
      </div>
    {/if}
  </div>
</section>

{#if showDeleteModal}
  <div class="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
    <div class="bg-gray-900 border-2 border-red-700 rounded-2xl p-8 shadow-2xl w-full max-w-sm text-center">
      <h2 class="text-lg font-bold text-red-400 mb-4">Confirm Delete</h2>
      <p class="text-gray-300 mb-6 text-sm">Permanently delete this post and all its comments? This cannot be undone.</p>
      <div class="flex gap-3 justify-center">
        <button
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
          on:click={deletePost}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
        <button
          class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
          on:click={() => { showDeleteModal = false; deleteTargetPostId = null; }}
          disabled={deleting}
        >
          Cancel
        </button>
      </div>
      {#if deleteError}
        <p class="text-red-400 mt-4 text-sm">{deleteError}</p>
      {/if}
    </div>
  </div>
{/if}

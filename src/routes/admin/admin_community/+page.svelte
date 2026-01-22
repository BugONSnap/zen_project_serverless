<script lang="ts">
  export let data: { posts: any[] };
  let posts = data.posts ?? [];
  let showDeleteModal = false;
  let deleteTargetPostId: number | null = null;
  let deleting = false;
  let deleteError = '';

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
      const data = await res.json();
      if (res.ok) {
        posts = posts.filter(p => p.id !== deleteTargetPostId);
        showDeleteModal = false;
        deleteTargetPostId = null;
      } else {
        deleteError = data.error || 'Failed to delete post.';
      }
    } catch (e) {
      deleteError = 'Network error.';
    } finally {
      deleting = false;
    }
  }
</script>

<div class="min-h-screen text-white relative" style="background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%); font-family: poppins;">
  <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
  <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>

  <main class="max-w-6xl mx-auto px-4 py-6 space-y-6 relative z-10">
      <section class="rounded-3xl border-2 border-amber-400/30 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-8">
        <div class="text-center space-y-2 mb-8">
          <p class="text-xs uppercase tracking-[0.35em] text-amber-400/70">Administration</p>
          <h1 class="text-3xl font-bold text-amber-400 dashboard-heading">Community Posts</h1>
          <p class="text-gray-300">View all posts submitted by users in the community.</p>
        </div>
        {#if posts.length === 0}
          <p class="text-gray-500">No posts found.</p>
        {:else}
          <div class="space-y-6">
            {#each posts as post}
  <div class="rounded-xl border border-amber-400/20 bg-gray-800/70 p-6 shadow-lg relative">
    <div class="flex justify-between items-center mb-2">
      <div class="flex items-center gap-2">
        <span class="font-semibold text-amber-300">{post.user?.username ?? 'Unknown'}</span>
        <span class="text-xs bg-amber-800/60 text-amber-200 px-2 py-1 rounded">{post.user?.userType?.name ?? ''}</span>
        <span class="text-xs text-gray-500 ml-2">(User ID: {post.user?.id ?? 'N/A'})</span>
      </div>
      <span class="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
    </div>
    <div class="mb-2">
      <p class="text-lg font-medium text-white">{post.content}</p>
      <p class="text-sm text-amber-400 mt-1">Rating: {post.rating}</p>
      <p class="text-xs text-gray-500">Post ID: {post.id}</p>
    </div>
    <div class="flex gap-4 text-xs text-gray-400 mt-2">
      <span>Likes: {post.likes?.filter(l => l.isLike).length ?? 0}</span>
      <span>Dislikes: {post.likes?.filter(l => !l.isLike).length ?? 0}</span>
      <span>Replies: {post.replies?.length ?? 0}</span>
    </div>
    <button class="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold transition" on:click={() => confirmDelete(post.id)}>
      Delete
    </button>
  </div>
{/each}

{#if showDeleteModal}
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
    <div class="bg-gray-900 border-2 border-red-700 rounded-2xl p-8 shadow-2xl w-full max-w-xs text-center">
      <h2 class="text-lg font-bold text-red-400 mb-4">Confirm Delete</h2>
      <p class="text-gray-300 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
      <div class="flex gap-4 justify-center">
        <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold" on:click={deletePost} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
        <button class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold" on:click={() => { showDeleteModal = false; deleteTargetPostId = null; }} disabled={deleting}>Cancel</button>
      </div>
      {#if deleteError}
        <p class="text-red-400 mt-4">{deleteError}</p>
      {/if}
    </div>
  </div>
{/if}


          </div>
        {/if}
      </section>
    </main>
</div>

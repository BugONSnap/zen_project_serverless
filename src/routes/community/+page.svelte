<script lang="ts">
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    export let data: { posts: any[], user?: any };
    
    // Post creation
    let content = '';
    let rating = 5;
    let submitting = false;
    let error = '';
    let showCreatePost = false;
    
    // Posts and sorting
    let posts = data?.posts ?? [];
    let sortBy: 'new' | 'hot' | 'top' = 'new';
    let expandedPosts: Set<number> = new Set();
    
    // Replies
    let replyContent: Record<number, string> = {};
    let replySubmitting: Record<number, boolean> = {};
    let showReplyInput: Record<number, boolean> = {};
    
    // Nested replies (replies to comments)
    let nestedReplyContent: Record<string, string> = {}; // key: "postId-replyId"
    let nestedReplySubmitting: Record<string, boolean> = {};
    let showNestedReplyInput: Record<string, boolean> = {};
    
    // Track reply hierarchy: maps replyId -> parentReplyId
    let replyHierarchy: Record<number, number> = {};
    
    // Search
    let searchQuery = '';
    
    // Voting for posts
    let likeLoading: Record<number, boolean> = {};
    
    // Voting for replies
    let replyLikeLoading: Record<number, boolean> = {};
    
    // Edit/delete logic for posts
    let editingPost: any = null;
    let editContent = '';
    let editRating = 5;
    let editError = '';
    let editSubmitting = false;
    let showDeleteModal = false;
    let deleteTargetPostId: number | null = null;
    let deleteError = '';
    let deleteSubmitting = false;
    
    // Edit/delete logic for replies
    let editingReply: any = null;
    let editReplyContent: Record<number, string> = {};
    let editReplySubmitting: Record<number, boolean> = {};
    let editReplyError: Record<number, string> = {};
    let showDeleteReplyModal = false;
    let deleteTargetReplyId: number | null = null;
    let deleteTargetReplyPostId: number | null = null;
    let deleteReplyError = '';
    let deleteReplySubmitting = false;

    // Calculate score (likes - dislikes)
    function getScore(post: any) {
        const likes = post.likes?.filter((l: any) => l.isLike).length || 0;
        const dislikes = post.likes?.filter((l: any) => !l.isLike).length || 0;
        return likes - dislikes;
    }

    // Get vote status
    function userVoteStatus(post: any) {
        if (!data.user) return null;
        const like = post.likes?.find((l: any) => l.userId === data.user.id);
        return like ? (like.isLike ? 1 : -1) : 0;
    }

    // Toggle vote
    async function toggleVote(postId: number, isLike: boolean) {
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

    // Calculate reply score (likes - dislikes)
    function getReplyScore(reply: any) {
        const likes = reply.likes?.filter((l: any) => l.isLike).length || 0;
        const dislikes = reply.likes?.filter((l: any) => !l.isLike).length || 0;
        return likes - dislikes;
    }

    // Get reply vote status
    function userReplyVoteStatus(reply: any) {
        if (!data.user) return null;
        const like = reply.likes?.find((l: any) => l.userId === data.user.id);
        return like ? (like.isLike ? 1 : -1) : 0;
    }

    // Toggle reply vote
    async function toggleReplyVote(replyId: number, isLike: boolean) {
        if (!data.user) return;
        replyLikeLoading[replyId] = true;
        try {
            const res = await fetch('', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ replyId, isLike })
            });
            const result = await res.json();
            if (res.ok) {
                posts = posts.map((post: { id: number, replies: any[] }) => {
                    if (!post.replies) return post;
                    post.replies = post.replies.map((reply: { id: number, likes: any[] }) => {
                        if (reply.id !== replyId) return reply;
                        let likes = (reply.likes || []).filter((l: { userId: number }) => l.userId !== data.user.id);
                        if (result.like) likes = [...likes, result.like];
                        reply.likes = likes;
                        return reply;
                    });
                    return post;
                });
            }
        } finally {
            replyLikeLoading[replyId] = false;
        }
    }

    // Format time ago
    function timeAgo(date: Date | string) {
        const now = new Date();
        const then = new Date(date);
        const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
        
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks}w ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months}mo ago`;
        return `${Math.floor(days / 365)}y ago`;
    }

    // Sort and filter posts
    $: sortedPosts = (() => {
        let filtered = [...posts];
        
        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(post => 
                post.content.toLowerCase().includes(query) ||
                post.user?.username?.toLowerCase().includes(query)
            );
        }
        
        // Apply sorting
        if (sortBy === 'new') {
            return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === 'top') {
            return filtered.sort((a, b) => getScore(b) - getScore(a));
        } else { // hot
            // Hot algorithm: score / (hours since post + 2)^1.8
            return filtered.sort((a, b) => {
                const hoursA = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
                const hoursB = (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60);
                const hotA = getScore(a) / Math.pow(hoursA + 2, 1.8);
                const hotB = getScore(b) / Math.pow(hoursB + 2, 1.8);
                return hotB - hotA;
            });
        }
    })();

    // Toggle post expansion
    function toggleExpand(postId: number) {
        if (expandedPosts.has(postId)) {
            expandedPosts.delete(postId);
        } else {
            expandedPosts.add(postId);
        }
        expandedPosts = expandedPosts; // Trigger reactivity
    }

    // Toggle reply input
    function toggleReplyInput(postId: number) {
        showReplyInput[postId] = !showReplyInput[postId];
        showReplyInput = showReplyInput; // Trigger reactivity
    }

    // Toggle nested reply input (reply to a comment)
    function toggleNestedReplyInput(postId: number, replyId: number) {
        const key = `${postId}-${replyId}`;
        showNestedReplyInput[key] = !showNestedReplyInput[key];
        showNestedReplyInput = showNestedReplyInput; // Trigger reactivity
    }

    // Submit nested reply (reply to a comment)
    async function submitNestedReply(postId: number, replyId: number) {
        const key = `${postId}-${replyId}`;
        if (!nestedReplyContent[key] || !data.user) return;
        nestedReplySubmitting[key] = true;
        try {
            const res = await fetch('', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    postId, 
                    content: nestedReplyContent[key],
                    parentReplyId: replyId // Tracked in frontend only
                })
            });
            const result = await res.json();
            if (res.ok) {
                // Store the parent-child relationship
                replyHierarchy[result.reply.id] = replyId;
                replyHierarchy = replyHierarchy; // Trigger reactivity
                
                posts = posts.map((post: { id: number, replies: any[] }) => {
                    if (post.id !== postId) return post;
                    post.replies = [...(post.replies || []), result.reply];
                    return post;
                });
                nestedReplyContent[key] = '';
                showNestedReplyInput[key] = false;
            }
        } finally {
            nestedReplySubmitting[key] = false;
        }
    }
    
    // Organize replies into a tree structure
    function organizeReplies(replies: any[]): any[] {
        if (!replies || replies.length === 0) return [];
        
        // Separate top-level replies from nested replies
        const topLevel: any[] = [];
        const childrenMap: Record<number, any[]> = {};
        
        replies.forEach((reply) => {
            const parentId = replyHierarchy[reply.id];
            if (parentId) {
                // This is a nested reply
                if (!childrenMap[parentId]) {
                    childrenMap[parentId] = [];
                }
                childrenMap[parentId].push(reply);
            } else {
                // This is a top-level reply
                topLevel.push(reply);
            }
        });
        
        // Recursively attach children to their parents
        function attachChildren(reply: any): any {
            const children = childrenMap[reply.id] || [];
            return {
                ...reply,
                children: children.map(attachChildren)
            };
        }
        
        return topLevel.map(attachChildren);
    }

    // Submit post
    async function submitPost() {
        submitting = true;
        error = '';
        try {
            const res = await fetch('', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, rating: Number(rating) })
            });
            const result = await res.json();
            if (res.ok) {
                posts = [result.post, ...posts];
                content = '';
                rating = 5;
                showCreatePost = false;
            } else {
                error = result.error || 'Failed to create post';
            }
        } catch (e) {
            error = 'Network error.';
        } finally {
            submitting = false;
        }
    }

    // Submit reply
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
                showReplyInput[postId] = false;
            }
        } finally {
            replySubmitting[postId] = false;
        }
    }

    // Edit functions
    function startEdit(post: any) {
        editingPost = { ...post };
        editContent = post.content;
        editRating = post.rating;
        editError = '';
    }

    async function saveEdit(): Promise<void> {
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

    // Delete functions
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

    // Edit/delete functions for replies
    function startEditReply(reply: any) {
        editingReply = { ...reply };
        editReplyContent[reply.id] = reply.content;
        editReplyError[reply.id] = '';
    }

    function cancelEditReply() {
        if (editingReply) {
            editReplyContent[editingReply.id] = '';
            editReplyError[editingReply.id] = '';
        }
        editingReply = null;
    }

    async function saveEditReply(): Promise<void> {
        if (!editingReply) return;
        editReplySubmitting[editingReply.id] = true;
        editReplyError[editingReply.id] = '';
        try {
            const res = await fetch('', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    replyId: editingReply.id, 
                    content: editReplyContent[editingReply.id] 
                })
            });
            const result = await res.json();
            if (res.ok) {
                posts = posts.map((post: { id: number, replies: any[] }) => {
                    if (!post.replies) return post;
                    post.replies = post.replies.map((reply: { id: number, content: string }) =>
                        reply.id === editingReply.id 
                            ? { ...reply, content: editReplyContent[editingReply.id] } 
                            : reply
                    );
                    return post;
                });
                cancelEditReply();
            } else {
                editReplyError[editingReply.id] = result.error || 'Failed to edit reply.';
            }
        } catch (e) {
            editReplyError[editingReply.id] = 'Network error.';
        } finally {
            editReplySubmitting[editingReply.id] = false;
        }
    }

    function confirmDeleteReply(replyId: number, postId: number) {
        deleteTargetReplyId = replyId;
        deleteTargetReplyPostId = postId;
        deleteReplyError = '';
        showDeleteReplyModal = true;
    }

    function cancelDeleteReply() {
        showDeleteReplyModal = false;
        deleteTargetReplyId = null;
        deleteTargetReplyPostId = null;
        deleteReplyError = '';
    }

    async function doDeleteReply() {
        if (!deleteTargetReplyId || !deleteTargetReplyPostId) return;
        deleteReplySubmitting = true;
        deleteReplyError = '';
        try {
            const res = await fetch('', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ replyId: deleteTargetReplyId })
            });
            const result = await res.json();
            if (res.ok) {
                const replyIdToDelete = deleteTargetReplyId;
                posts = posts.map((post: { id: number, replies: any[] }) => {
                    if (post.id !== deleteTargetReplyPostId) return post;
                    post.replies = (post.replies || []).filter((reply: any) => reply.id !== replyIdToDelete);
                    // Also remove from hierarchy if it exists
                    if (replyIdToDelete !== null) {
                        delete replyHierarchy[replyIdToDelete];
                        replyHierarchy = replyHierarchy;
                    }
                    return post;
                });
                showDeleteReplyModal = false;
                deleteTargetReplyId = null;
                deleteTargetReplyPostId = null;
            } else {
                deleteReplyError = result.error || 'Failed to delete reply.';
            }
        } catch (e) {
            deleteReplyError = 'Network error.';
        } finally {
            deleteReplySubmitting = false;
        }
    }
    
    // Check if user can edit/delete a reply
    function canEditDeleteReply(reply: any): boolean {
        if (!data.user) return false;
        if (reply.userId === data.user.id) return true;
        const adminLevel = data.user.adminLevel ?? 2;
        return adminLevel <= 1; // superadmin (0) or admin (1)
    }
</script>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    .community-container {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .post-card {
        background: rgba(31, 41, 55, 0.6);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        transition: all 0.3s;
    }
    
    .post-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px 0 rgba(217, 119, 6, 0.1);
    }
    
    .vote-button {
        background: transparent;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 6px;
        transition: all 0.2s;
        border-radius: 6px;
    }
    
    .vote-button:hover {
        background: rgba(217, 119, 6, 0.1);
        transform: scale(1.1);
    }
    
    .vote-button.upvoted {
        color: #fbbf24;
    }
    
    .vote-button.downvoted {
        color: #60a5fa;
    }
    
    .score {
        font-weight: 700;
        font-size: 13px;
        line-height: 16px;
        color: #d1d5db;
    }
    
    .score.positive {
        color: #fbbf24;
    }
    
    .score.negative {
        color: #60a5fa;
    }
    
    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #fbbf24 0%, #10b981 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
        color: #1f2937;
        border: 2px solid rgba(251, 191, 36, 0.3);
        box-shadow: 0 2px 8px rgba(217, 119, 6, 0.2);
    }
    
    .sort-button {
        background: transparent;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
    }
    
    .sort-button:hover {
        background: rgba(217, 119, 6, 0.1);
        color: #fbbf24;
    }
    
    .sort-button.active {
        background: rgba(217, 119, 6, 0.2);
        color: #fbbf24;
        font-weight: 700;
    }
    
    .create-post-card {
        background: rgba(31, 41, 55, 0.8);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        box-shadow: 0 8px 32px 0 rgba(217, 119, 6, 0.2);
    }
    
    .reply-thread {
        margin-left: 0;
        margin-top: 0;
    }
    
    .modal-overlay {
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
    }
    
    .modal-content {
        background: rgba(31, 41, 55, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 2px solid rgba(217, 119, 6, 0.3);
        border-radius: 16px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
    }
</style>

<div class="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white community-container relative" style="font-family: poppins;">
    <!-- Decorative background elements -->
    <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>
    
    <DashboardHeader title="Community" user={data.user} pageName="Community" />
    
    <main class="max-w-4xl mx-auto px-4 py-6 relative z-10">
        <!-- Top Ribbon with Search, Create Post, and Sort -->
        <div class="mb-6 bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-gray-700/50 shadow-xl">
            <div class="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <!-- Search Bar -->
                <div class="flex-1 relative">
                    <input 
                        type="text" 
                        class="w-full bg-gray-900/60 border-2 border-gray-700 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                        placeholder=" Search posts and users..."
                        bind:value={searchQuery}
                    />
                    <div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                        🔍
                    </div>
                </div>
                
                <!-- Create Post Button -->
                <div class="flex-shrink-0">
                    {#if data.user}
                        <button 
                            class="w-full md:w-auto bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold py-3 px-6 rounded-lg text-base shadow-lg hover:shadow-xl transition-all ring-2 ring-amber-500 ring-offset-2 ring-offset-gray-800 flex items-center justify-center gap-2"
                            on:click={() => showCreatePost = !showCreatePost}
                        >
                            {#if showCreatePost}
                                <span>✕</span> <span>Cancel</span>
                            {:else}
                                <span>✏️</span> <span>Create Post</span>
                            {/if}
                        </button>
                    {:else}
                        <a 
                            href="/login"
                            class="w-full md:w-auto bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold py-3 px-6 rounded-lg text-base shadow-lg hover:shadow-xl transition-all ring-2 ring-amber-500 ring-offset-2 ring-offset-gray-800 flex items-center justify-center gap-2"
                        >
                            <span>🔐</span> <span>Login</span>
                        </a>
                    {/if}
                </div>
            </div>
            
            <!-- Sort Options -->
            <div class="mt-4 pt-4 border-t border-gray-700/50 flex items-center gap-2 flex-wrap">
                <span class="text-sm font-semibold text-gray-400 mr-2">Sort by:</span>
                <button 
                    class="sort-button {sortBy === 'hot' ? 'active' : ''}"
                    on:click={() => sortBy = 'hot'}
                >
                    🔥 Hot
                </button>
                <button 
                    class="sort-button {sortBy === 'new' ? 'active' : ''}"
                    on:click={() => sortBy = 'new'}
                >
                    ✨ New
                </button>
                <button 
                    class="sort-button {sortBy === 'top' ? 'active' : ''}"
                    on:click={() => sortBy = 'top'}
                >
                    ⬆️ Top
                </button>
                {#if searchQuery.trim()}
                    <span class="ml-auto text-sm text-gray-400">
                        {sortedPosts.length} {sortedPosts.length === 1 ? 'result' : 'results'}
                    </span>
                {/if}
            </div>
        </div>

        <!-- Create Post Card -->
        {#if showCreatePost && data.user}
            <div class="create-post-card mb-6 bg-gray-800/90 backdrop-blur-sm border border-amber-400/30 rounded-2xl shadow-xl">
                <div class="p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-emerald-400 flex items-center justify-center font-bold text-gray-900">
                            {data.user?.username?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-white">Create a post</h3>
                            <p class="text-sm text-gray-400">Share your thoughts with the community</p>
                        </div>
                    </div>
                    <form on:submit|preventDefault={submitPost} class="space-y-4">
                        <textarea 
                            class="w-full bg-gray-900/60 border-2 border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none transition-colors" 
                            rows="5" 
                            bind:value={content} 
                            maxlength="500" 
                            placeholder="What's on your mind? Share your experience with ZenTry..."
                            required
                        ></textarea>
                        <div class="flex items-center justify-between flex-wrap gap-4">
                            <div class="flex items-center gap-3">
                                <label for="rating" class="text-sm font-semibold text-gray-300">Rating:</label>
                                <select 
                                    id="rating" 
                                    class="bg-gray-900/60 border-2 border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-400 transition-colors font-medium"
                                    bind:value={rating} 
                                    required
                                >
                                    <option value="1">⭐ 1 Star</option>
                                    <option value="2">⭐⭐ 2 Stars</option>
                                    <option value="3">⭐⭐⭐ 3 Stars</option>
                                    <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                class="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold py-3 px-8 rounded-lg text-base shadow-lg hover:shadow-xl transition-all ring-2 ring-amber-500 ring-offset-2 ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={submitting}
                            >
                                {submitting ? '📤 Posting...' : '🚀 Post'}
                            </button>
                        </div>
                        {#if error}
                            <div class="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>
                        {/if}
                    </form>
                </div>
            </div>
        {/if}

        <!-- Posts List -->
        {#if sortedPosts.length === 0}
            <div class="post-card p-12 text-center bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700/50 rounded-2xl">
                <div class="text-6xl mb-4">💬</div>
                <p class="text-gray-300 text-xl font-semibold mb-2">No posts yet</p>
                <p class="text-gray-400">Be the first to share your thoughts with the community!</p>
                {#if data.user}
                    <button 
                        class="mt-6 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all"
                        on:click={() => showCreatePost = true}
                    >
                        Create First Post
                    </button>
                {/if}
            </div>
        {:else}
            <div class="space-y-4">
                {#each sortedPosts as post (post.id)}
                    <article class="post-card p-4 flex gap-4 bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700/50 rounded-xl hover:border-amber-400/50 transition-all">
                        <!-- Voting Section (Left) -->
                        <div class="flex flex-col items-center gap-1 pt-1">
                            <button 
                                class="vote-button {userVoteStatus(post) === 1 ? 'upvoted' : ''}"
                                disabled={likeLoading[post.id] || !data.user}
                                on:click={() => toggleVote(post.id, true)}
                                aria-label="Upvote"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166 1.23a1.128 1.128 0 0 1 1.668.004l7.872 8.715a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 2.31 2.258 9.75H7.25v8ZM2.227 9.785l-.012.016c.01-.006.014-.01.012-.016Z"/>
                                </svg>
                            </button>
                            <span class="score {getScore(post) > 0 ? 'positive' : getScore(post) < 0 ? 'negative' : ''}">
                                {getScore(post)}
                            </span>
                            <button 
                                class="vote-button {userVoteStatus(post) === -1 ? 'downvoted' : ''}"
                                disabled={likeLoading[post.id] || !data.user}
                                on:click={() => toggleVote(post.id, false)}
                                aria-label="Downvote"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style="transform: rotate(180deg);">
                                    <path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166 1.23a1.128 1.128 0 0 1 1.668.004l7.872 8.715a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 2.31 2.258 9.75H7.25v8ZM2.227 9.785l-.012.016c.01-.006.014-.01.012-.016Z"/>
                                </svg>
                            </button>
                        </div>

                        <!-- Post Content (Right) -->
                        <div class="flex-1 min-w-0">
                            <!-- Post Header -->
                            <div class="flex items-center gap-2 mb-2 text-xs text-[#818384]">
                                <div class="user-avatar">
                                    {post.user?.username?.charAt(0).toUpperCase() ?? '?'}
                                </div>
                                <span class="font-semibold text-[#d7dadc] hover:underline cursor-pointer">
                                    u/{post.user?.username ?? 'Unknown'}
                                </span>
                                <span class="text-[#818384]">•</span>
                                <span>{timeAgo(post.createdAt)}</span>
                                {#if post.user?.userType?.name}
                                    <span class="px-2 py-0.5 bg-[#272729] rounded-full text-[#d97706] font-medium">
                                        {post.user.userType.name}
                                    </span>
                                {/if}
                                <span class="ml-auto flex items-center gap-1 text-yellow-400">
                                    {'★'.repeat(post.rating)}
                                </span>
                                {#if data.user && (post.userId === data.user.id || (data.user.adminLevel ?? 2) <= 1)}
                                    <button 
                                        class="text-[#818384] hover:text-[#d7dadc] px-2 py-1 rounded hover:bg-[#272729] transition-colors"
                                        on:click={() => startEdit(post)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        class="text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-[#272729] transition-colors"
                                        on:click={() => confirmDelete(post.id)}
                                    >
                                        Delete
                                    </button>
                                {/if}
                            </div>

                            <!-- Post Title/Content -->
                            <div class="mb-2">
                                <p class="text-[#d7dadc] text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {post.content}
                                </p>
                            </div>

                            <!-- Post Actions -->
                            <div class="flex items-center gap-3 mt-3 pt-3 border-t border-gray-700/50">
                                {#if data.user}
                                    <button 
                                        class="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-4 py-2 rounded-lg transition-colors font-medium text-sm border border-emerald-500/30"
                                        on:click={() => toggleReplyInput(post.id)}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M13.5 2.5a1 1 0 0 0-1-1h-11a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2.5l2 2 2-2H12.5a1 1 0 0 0 1-1v-9Z"/>
                                        </svg>
                                        <span>💬 Comment</span>
                                    </button>
                                {/if}
                                <button 
                                    class="flex items-center gap-2 text-gray-400 hover:text-amber-400 px-4 py-2 rounded-lg hover:bg-gray-700/30 transition-colors font-medium text-sm"
                                    on:click={() => toggleExpand(post.id)}
                                >
                                    {expandedPosts.has(post.id) ? '👁️ Hide' : '👁️ Show'} ({post.replies?.length || 0}) comments
                                </button>
                            </div>

                            <!-- Reply Input -->
                            {#if showReplyInput[post.id] && data.user}
                                <div class="mt-4 pt-4 border-t-2 border-gray-700/50 bg-gray-900/40 rounded-xl p-4">
                                    <div class="flex items-center gap-2 mb-3">
                                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-emerald-400 flex items-center justify-center font-bold text-gray-900 text-sm">
                                            {data.user?.username?.charAt(0).toUpperCase() ?? '?'}
                                        </div>
                                        <span class="text-sm font-semibold text-gray-300">Replying as u/{data.user?.username}</span>
                                    </div>
                                    <textarea 
                                        class="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 resize-none mb-3 transition-colors" 
                                        rows="3" 
                                        bind:value={replyContent[post.id]} 
                                        maxlength="250" 
                                        placeholder="What are your thoughts? Share your opinion..."
                                    ></textarea>
                                    <div class="flex justify-end gap-3">
                                        <button 
                                            class="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-700/30 transition-colors font-medium"
                                            on:click={() => { showReplyInput[post.id] = false; replyContent[post.id] = ''; }}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            class="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-2 rounded-lg text-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            disabled={!replyContent[post.id] || replySubmitting[post.id]}
                                            on:click={() => submitReply(post.id)}
                                        >
                                            {replySubmitting[post.id] ? '📤 Replying...' : '💬 Reply'}
                                        </button>
                                    </div>
                                </div>
                            {/if}

                            <!-- Comments Section -->
                            {#if expandedPosts.has(post.id)}
                                <div class="mt-4 pt-4 border-t-2 border-gray-700/50 space-y-4">
                                    <h4 class="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                                        <span>💬</span> {post.replies?.length || 0} {(post.replies?.length || 0) === 1 ? 'Comment' : 'Comments'}
                                    </h4>
                                    
                                    {#if post.replies && post.replies.length > 0}
                                        {#each organizeReplies(post.replies) as reply (reply.id)}
                                            <!-- Render Reply Component -->
                                            <div class="reply-thread bg-gray-900/40 rounded-lg p-4 border-l-4 border-emerald-400/50">
                                                <div class="flex items-center gap-2 mb-2 text-xs">
                                                    <div class="user-avatar" style="width: 28px; height: 28px; font-size: 13px; background: linear-gradient(135deg, #d97706 0%, #1e40af 100%);">
                                                        {reply.user?.username?.charAt(0).toUpperCase() ?? '?'}
                                                    </div>
                                                    <span class="font-bold text-emerald-300">
                                                        u/{reply.user?.username ?? 'Unknown'}
                                                    </span>
                                                    <span class="text-gray-500">•</span>
                                                    <span class="text-gray-400">{timeAgo(reply.createdAt)}</span>
                                                    {#if canEditDeleteReply(reply)}
                                                        <span class="ml-auto flex items-center gap-2">
                                                            <button 
                                                                class="text-[#818384] hover:text-[#d7dadc] px-2 py-1 rounded hover:bg-[#272729] transition-colors text-xs"
                                                                on:click={() => startEditReply(reply)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                class="text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-[#272729] transition-colors text-xs"
                                                                on:click={() => confirmDeleteReply(reply.id, post.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </span>
                                                    {/if}
                                                </div>
                                                {#if editingReply && editingReply.id === reply.id}
                                                    <div class="mb-3">
                                                        <textarea 
                                                            class="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg p-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 resize-none transition-colors" 
                                                            rows="3" 
                                                            bind:value={editReplyContent[reply.id]} 
                                                            maxlength="250" 
                                                        ></textarea>
                                                        {#if editReplyError[reply.id]}
                                                            <div class="mt-2 bg-red-900/30 border border-red-500/50 text-red-300 px-3 py-2 rounded-lg text-xs">{editReplyError[reply.id]}</div>
                                                        {/if}
                                                        <div class="flex justify-end gap-2 mt-2">
                                                            <button 
                                                                class="text-xs text-gray-400 hover:text-white px-3 py-1 rounded hover:bg-gray-700/30 transition-colors"
                                                                on:click={cancelEditReply}
                                                                disabled={editReplySubmitting[reply.id]}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                class="text-xs bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-1 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                on:click={saveEditReply}
                                                                disabled={editReplySubmitting[reply.id] || !editReplyContent[reply.id]}
                                                            >
                                                                {editReplySubmitting[reply.id] ? 'Saving...' : 'Save'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                {:else}
                                                    <p class="text-sm text-gray-200 leading-relaxed pl-10 mb-3">
                                                        {reply.content}
                                                    </p>
                                                {/if}
                                                
                                                <!-- Voting Section for Reply -->
                                                <div class="flex items-center gap-2 pl-10 mb-2">
                                                    <button 
                                                        class="vote-button {userReplyVoteStatus(reply) === 1 ? 'upvoted' : ''}"
                                                        style="width: 16px; height: 16px; padding: 2px;"
                                                        disabled={replyLikeLoading[reply.id] || !data.user}
                                                        on:click={() => toggleReplyVote(reply.id, true)}
                                                        aria-label="Upvote"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166 1.23a1.128 1.128 0 0 1 1.668.004l7.872 8.715a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 2.31 2.258 9.75H7.25v8ZM2.227 9.785l-.012.016c.01-.006.014-.01.012-.016Z"/>
                                                        </svg>
                                                    </button>
                                                    <span class="score text-xs {getReplyScore(reply) > 0 ? 'positive' : getReplyScore(reply) < 0 ? 'negative' : ''}" style="font-size: 11px; min-width: 20px; text-align: center;">
                                                        {getReplyScore(reply)}
                                                    </span>
                                                    <button 
                                                        class="vote-button {userReplyVoteStatus(reply) === -1 ? 'downvoted' : ''}"
                                                        style="width: 16px; height: 16px; padding: 2px;"
                                                        disabled={replyLikeLoading[reply.id] || !data.user}
                                                        on:click={() => toggleReplyVote(reply.id, false)}
                                                        aria-label="Downvote"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style="transform: rotate(180deg);">
                                                            <path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166 1.23a1.128 1.128 0 0 1 1.668.004l7.872 8.715a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 2.31 2.258 9.75H7.25v8ZM2.227 9.785l-.012.016c.01-.006.014-.01.012-.016Z"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                                
                                                <!-- Reply to Comment Button -->
                                                {#if data.user}
                                                    <div class="pl-10">
                                                        <button 
                                                            class="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 mb-2"
                                                            on:click={() => toggleNestedReplyInput(post.id, reply.id)}
                                                        >
                                                            <span>↩️</span> Reply
                                                        </button>
                                                        
                                                        <!-- Nested Reply Input -->
                                                        {#if showNestedReplyInput[`${post.id}-${reply.id}`]}
                                                            <div class="mt-2 bg-gray-800/60 rounded-lg p-3 border border-emerald-400/30">
                                                                <textarea 
                                                                    class="w-full bg-gray-900/60 border-2 border-gray-700 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 resize-none mb-2 transition-colors" 
                                                                    rows="2" 
                                                                    bind:value={nestedReplyContent[`${post.id}-${reply.id}`]} 
                                                                    maxlength="250" 
                                                                    placeholder={`Reply to u/${reply.user?.username ?? 'user'}...`}
                                                                ></textarea>
                                                                <div class="flex justify-end gap-2">
                                                                    <button 
                                                                        class="text-xs text-gray-400 hover:text-white px-3 py-1 rounded hover:bg-gray-700/30 transition-colors"
                                                                        on:click={() => { 
                                                                            showNestedReplyInput[`${post.id}-${reply.id}`] = false; 
                                                                            nestedReplyContent[`${post.id}-${reply.id}`] = ''; 
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button 
                                                                        class="text-xs bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-1 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        disabled={!nestedReplyContent[`${post.id}-${reply.id}`] || nestedReplySubmitting[`${post.id}-${reply.id}`]}
                                                                        on:click={() => submitNestedReply(post.id, reply.id)}
                                                                    >
                                                                        {nestedReplySubmitting[`${post.id}-${reply.id}`] ? 'Posting...' : 'Reply'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        {/if}
                                                    </div>
                                                {/if}
                                                
                                                <!-- Render nested children -->
                                                {#if reply.children && reply.children.length > 0}
                                                    <div class="ml-8 mt-3 space-y-3">
                                                        {#each reply.children as childReply (childReply.id)}
                                                            <div class="reply-thread bg-gray-900/50 rounded-lg p-4 border-l-4 border-emerald-500/40">
                                                                <div class="flex items-center gap-2 mb-2 text-xs">
                                                                    <div class="user-avatar" style="width: 24px; height: 24px; font-size: 12px; background: linear-gradient(135deg, #d97706 0%, #1e40af 100%);">
                                                                        {childReply.user?.username?.charAt(0).toUpperCase() ?? '?'}
                                                                    </div>
                                                                    <span class="font-bold text-emerald-300">
                                                                        u/{childReply.user?.username ?? 'Unknown'}
                                                                    </span>
                                                                    <span class="text-gray-500">•</span>
                                                                    <span class="text-gray-400">{timeAgo(childReply.createdAt)}</span>
                                                                    {#if canEditDeleteReply(childReply)}
                                                                        <span class="ml-auto flex items-center gap-2">
                                                                            <button 
                                                                                class="text-[#818384] hover:text-[#d7dadc] px-2 py-1 rounded hover:bg-[#272729] transition-colors text-xs"
                                                                                on:click={() => startEditReply(childReply)}
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button 
                                                                                class="text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-[#272729] transition-colors text-xs"
                                                                                on:click={() => confirmDeleteReply(childReply.id, post.id)}
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </span>
                                                                    {/if}
                                                                </div>
                                                                {#if editingReply && editingReply.id === childReply.id}
                                                                    <div class="mb-3">
                                                                        <textarea 
                                                                            class="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 resize-none transition-colors" 
                                                                            rows="2" 
                                                                            bind:value={editReplyContent[childReply.id]} 
                                                                            maxlength="250" 
                                                                        ></textarea>
                                                                        {#if editReplyError[childReply.id]}
                                                                            <div class="mt-2 bg-red-900/30 border border-red-500/50 text-red-300 px-2 py-1 rounded-lg text-xs">{editReplyError[childReply.id]}</div>
                                                                        {/if}
                                                                        <div class="flex justify-end gap-2 mt-2">
                                                                            <button 
                                                                                class="text-xs text-gray-400 hover:text-white px-3 py-1 rounded hover:bg-gray-700/30 transition-colors"
                                                                                on:click={cancelEditReply}
                                                                                disabled={editReplySubmitting[childReply.id]}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button 
                                                                                class="text-xs bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-1 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                on:click={saveEditReply}
                                                                                disabled={editReplySubmitting[childReply.id] || !editReplyContent[childReply.id]}
                                                                            >
                                                                                {editReplySubmitting[childReply.id] ? 'Saving...' : 'Save'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                {:else}
                                                                    <p class="text-sm text-gray-200 leading-relaxed pl-8 mb-3">
                                                                        {childReply.content}
                                                                    </p>
                                                                {/if}
                                                                
                                                                <!-- Voting Section for Nested Reply -->
                                                                <div class="flex items-center gap-2 pl-8 mb-2">
                                                                    <button 
                                                                        class="vote-button {userReplyVoteStatus(childReply) === 1 ? 'upvoted' : ''}"
                                                                        style="width: 14px; height: 14px; padding: 2px;"
                                                                        disabled={replyLikeLoading[childReply.id] || !data.user}
                                                                        on:click={() => toggleReplyVote(childReply.id, true)}
                                                                        aria-label="Upvote"
                                                                    >
                                                                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166 1.23a1.128 1.128 0 0 1 1.668.004l7.872 8.715a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 2.31 2.258 9.75H7.25v8ZM2.227 9.785l-.012.016c.01-.006.014-.01.012-.016Z"/>
                                                                        </svg>
                                                                    </button>
                                                                    <span class="score text-xs {getReplyScore(childReply) > 0 ? 'positive' : getReplyScore(childReply) < 0 ? 'negative' : ''}" style="font-size: 10px; min-width: 18px; text-align: center;">
                                                                        {getReplyScore(childReply)}
                                                                    </span>
                                                                    <button 
                                                                        class="vote-button {userReplyVoteStatus(childReply) === -1 ? 'downvoted' : ''}"
                                                                        style="width: 14px; height: 14px; padding: 2px;"
                                                                        disabled={replyLikeLoading[childReply.id] || !data.user}
                                                                        on:click={() => toggleReplyVote(childReply.id, false)}
                                                                        aria-label="Downvote"
                                                                    >
                                                                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style="transform: rotate(180deg);">
                                                                            <path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166 1.23a1.128 1.128 0 0 1 1.668.004l7.872 8.715a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 2.31 2.258 9.75H7.25v8ZM2.227 9.785l-.012.016c.01-.006.014-.01.012-.016Z"/>
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                                
                                                                <!-- Reply to nested comment -->
                                                                {#if data.user}
                                                                    <div class="pl-8">
                                                                        <button 
                                                                            class="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 mb-2"
                                                                            on:click={() => toggleNestedReplyInput(post.id, childReply.id)}
                                                                        >
                                                                            <span>↩️</span> Reply
                                                                        </button>
                                                                        
                                                                        <!-- Nested Reply Input -->
                                                                        {#if showNestedReplyInput[`${post.id}-${childReply.id}`]}
                                                                            <div class="mt-2 bg-gray-800/60 rounded-lg p-3 border border-emerald-400/30">
                                                                                <textarea 
                                                                                    class="w-full bg-gray-900/60 border-2 border-gray-700 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 resize-none mb-2 transition-colors" 
                                                                                    rows="2" 
                                                                                    bind:value={nestedReplyContent[`${post.id}-${childReply.id}`]} 
                                                                                    maxlength="250" 
                                                                                    placeholder={`Reply to u/${childReply.user?.username ?? 'user'}...`}
                                                                                ></textarea>
                                                                                <div class="flex justify-end gap-2">
                                                                                    <button 
                                                                                        class="text-xs text-gray-400 hover:text-white px-3 py-1 rounded hover:bg-gray-700/30 transition-colors"
                                                                                        on:click={() => { 
                                                                                            showNestedReplyInput[`${post.id}-${childReply.id}`] = false; 
                                                                                            nestedReplyContent[`${post.id}-${childReply.id}`] = ''; 
                                                                                        }}
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                    <button 
                                                                                        class="text-xs bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-1 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                        disabled={!nestedReplyContent[`${post.id}-${childReply.id}`] || nestedReplySubmitting[`${post.id}-${childReply.id}`]}
                                                                                        on:click={() => submitNestedReply(post.id, childReply.id)}
                                                                                    >
                                                                                        {nestedReplySubmitting[`${post.id}-${childReply.id}`] ? 'Posting...' : 'Reply'}
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        {/if}
                                                                    </div>
                                                                {/if}
                                                                
                                                                <!-- Render deeper nested children recursively -->
                                                                {#if childReply.children && childReply.children.length > 0}
                                                                    <div class="ml-8 mt-3 space-y-3">
                                                                        {#each childReply.children as grandChildReply (grandChildReply.id)}
                                                                            <div class="reply-thread bg-gray-900/60 rounded-lg p-4 border-l-4 border-emerald-600/30">
                                                                                <div class="flex items-center gap-2 mb-2 text-xs">
                                                                                    <div class="user-avatar" style="width: 22px; height: 22px; font-size: 11px; background: linear-gradient(135deg, #d97706 0%, #1e40af 100%);">
                                                                                        {grandChildReply.user?.username?.charAt(0).toUpperCase() ?? '?'}
                                                                                    </div>
                                                                                    <span class="font-bold text-emerald-300">
                                                                                        u/{grandChildReply.user?.username ?? 'Unknown'}
                                                                                    </span>
                                                                                    <span class="text-gray-500">•</span>
                                                                                    <span class="text-gray-400">{timeAgo(grandChildReply.createdAt)}</span>
                                                                                    {#if canEditDeleteReply(grandChildReply)}
                                                                                        <span class="ml-auto flex items-center gap-2">
                                                                                            <button 
                                                                                                class="text-[#818384] hover:text-[#d7dadc] px-1 py-0.5 rounded hover:bg-[#272729] transition-colors text-xs"
                                                                                                on:click={() => startEditReply(grandChildReply)}
                                                                                            >
                                                                                                Edit
                                                                                            </button>
                                                                                            <button 
                                                                                                class="text-red-400 hover:text-red-300 px-1 py-0.5 rounded hover:bg-[#272729] transition-colors text-xs"
                                                                                                on:click={() => confirmDeleteReply(grandChildReply.id, post.id)}
                                                                                            >
                                                                                                Delete
                                                                                            </button>
                                                                                        </span>
                                                                                    {/if}
                                                                                </div>
                                                                                {#if editingReply && editingReply.id === grandChildReply.id}
                                                                                    <div class="mb-3">
                                                                                        <textarea 
                                                                                            class="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 resize-none transition-colors" 
                                                                                            rows="2" 
                                                                                            bind:value={editReplyContent[grandChildReply.id]} 
                                                                                            maxlength="250" 
                                                                                        ></textarea>
                                                                                        {#if editReplyError[grandChildReply.id]}
                                                                                            <div class="mt-2 bg-red-900/30 border border-red-500/50 text-red-300 px-2 py-1 rounded-lg text-xs">{editReplyError[grandChildReply.id]}</div>
                                                                                        {/if}
                                                                                        <div class="flex justify-end gap-2 mt-2">
                                                                                            <button 
                                                                                                class="text-xs text-gray-400 hover:text-white px-3 py-1 rounded hover:bg-gray-700/30 transition-colors"
                                                                                                on:click={cancelEditReply}
                                                                                                disabled={editReplySubmitting[grandChildReply.id]}
                                                                                            >
                                                                                                Cancel
                                                                                            </button>
                                                                                            <button 
                                                                                                class="text-xs bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-4 py-1 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                                on:click={saveEditReply}
                                                                                                disabled={editReplySubmitting[grandChildReply.id] || !editReplyContent[grandChildReply.id]}
                                                                                            >
                                                                                                {editReplySubmitting[grandChildReply.id] ? 'Saving...' : 'Save'}
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                {:else}
                                                                                    <p class="text-sm text-gray-200 leading-relaxed pl-6 mb-3">
                                                                                        {grandChildReply.content}
                                                                                    </p>
                                                                                {/if}
                                                                                
                                                                                <!-- Voting Section for Deeply Nested Reply -->
                                                                                <div class="flex items-center gap-1 pl-6 mb-2">
                                                                                    <button 
                                                                                        class="vote-button {userReplyVoteStatus(grandChildReply) === 1 ? 'upvoted' : ''}"
                                                                                        style="width: 12px; height: 12px; padding: 1px;"
                                                                                        disabled={replyLikeLoading[grandChildReply.id] || !data.user}
                                                                                        on:click={() => toggleReplyVote(grandChildReply.id, true)}
                                                                                        aria-label="Upvote"
                                                                                    >
                                                                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
                                                                                            <path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166 1.23a1.128 1.128 0 0 1 1.668.004l7.872 8.715a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 2.31 2.258 9.75H7.25v8ZM2.227 9.785l-.012.016c.01-.006.014-.01.012-.016Z"/>
                                                                                        </svg>
                                                                                    </button>
                                                                                    <span class="score text-xs {getReplyScore(grandChildReply) > 0 ? 'positive' : getReplyScore(grandChildReply) < 0 ? 'negative' : ''}" style="font-size: 9px; min-width: 16px; text-align: center;">
                                                                                        {getReplyScore(grandChildReply)}
                                                                                    </span>
                                                                                    <button 
                                                                                        class="vote-button {userReplyVoteStatus(grandChildReply) === -1 ? 'downvoted' : ''}"
                                                                                        style="width: 12px; height: 12px; padding: 1px;"
                                                                                        disabled={replyLikeLoading[grandChildReply.id] || !data.user}
                                                                                        on:click={() => toggleReplyVote(grandChildReply.id, false)}
                                                                                        aria-label="Downvote"
                                                                                    >
                                                                                        <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" style="transform: rotate(180deg);">
                                                                                            <path d="M12.877 19H7.123A1.125 1.125 0 0 1 6 17.877V11H2.126a1.114 1.114 0 0 1-1.007-.7 1.249 1.249 0 0 1 .171-1.343L9.166 1.23a1.128 1.128 0 0 1 1.668.004l7.872 8.715a1.25 1.25 0 0 1 .176 1.348 1.113 1.113 0 0 1-1.005.7H14v6.877A1.125 1.125 0 0 1 12.877 19ZM7.25 17.75h5.5v-8h4.934L10 2.31 2.258 9.75H7.25v8ZM2.227 9.785l-.012.016c.01-.006.014-.01.012-.016Z"/>
                                                                                        </svg>
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        {/each}
                                                                    </div>
                                                                {/if}
                                                            </div>
                                                        {/each}
                                                    </div>
                                                {/if}
                                            </div>
                                        {/each}
                                    {:else}
                                        <div class="text-center py-6">
                                            <p class="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
                                        </div>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    </article>
                {/each}
            </div>
        {/if}
    </main>

    <!-- Edit Modal -->
    {#if editingPost}
        <div class="fixed inset-0 z-50 flex items-center justify-center modal-overlay" on:click={cancelEdit}>
            <div class="modal-content p-6 w-full max-w-md mx-4" on:click|stopPropagation>
                <div class="flex items-center gap-3 mb-4">
                    <div class="text-3xl">✏️</div>
                    <h2 class="text-2xl font-bold text-white">Edit Post</h2>
                </div>
                <textarea 
                    class="w-full bg-gray-900/60 border-2 border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 resize-none mb-4 transition-colors" 
                    rows="5" 
                    bind:value={editContent} 
                    maxlength="500" 
                    required
                ></textarea>
                <div class="flex items-center gap-4 mb-4">
                    <label for="editRating" class="text-sm font-semibold text-gray-300">Rating:</label>
                    <select 
                        id="editRating" 
                        class="bg-gray-900/60 border-2 border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-400 transition-colors font-medium"
                        bind:value={editRating} 
                        required
                    >
                        <option value="1">⭐ 1 Star</option>
                        <option value="2">⭐⭐ 2 Stars</option>
                        <option value="3">⭐⭐⭐ 3 Stars</option>
                        <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                        <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                    </select>
                </div>
                {#if editError}
                    <div class="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">{editError}</div>
                {/if}
                <div class="flex justify-end gap-3">
                    <button 
                        class="px-6 py-3 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors font-medium"
                        on:click={cancelEdit} 
                        disabled={editSubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        class="px-6 py-3 rounded-lg bg-amber-400 text-gray-900 font-bold hover:bg-amber-300 transition-all shadow-lg disabled:opacity-50"
                        on:click={saveEdit} 
                        disabled={editSubmitting}
                    >
                        {editSubmitting ? '💾 Saving...' : '💾 Save'}
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Delete Modal -->
    {#if showDeleteModal}
        <div class="fixed inset-0 z-50 flex items-center justify-center modal-overlay" on:click={cancelDelete}>
            <div class="modal-content p-6 w-full max-w-md mx-4" on:click|stopPropagation>
                <div class="flex items-center gap-3 mb-4">
                    <div class="text-3xl">⚠️</div>
                    <h2 class="text-2xl font-bold text-white">Delete Post</h2>
                </div>
                <p class="mb-6 text-gray-300 leading-relaxed">Are you sure you want to delete this post? This action cannot be undone.</p>
                {#if deleteError}
                    <div class="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">{deleteError}</div>
                {/if}
                <div class="flex justify-end gap-3">
                    <button 
                        class="px-6 py-3 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors font-medium"
                        on:click={cancelDelete} 
                        disabled={deleteSubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        class="px-6 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg disabled:opacity-50"
                        on:click={doDeletePost} 
                        disabled={deleteSubmitting}
                    >
                        {deleteSubmitting ? '🗑️ Deleting...' : '🗑️ Delete'}
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Delete Reply Modal -->
    {#if showDeleteReplyModal}
        <div class="fixed inset-0 z-50 flex items-center justify-center modal-overlay" on:click={cancelDeleteReply}>
            <div class="modal-content p-6 w-full max-w-md mx-4" on:click|stopPropagation>
                <div class="flex items-center gap-3 mb-4">
                    <div class="text-3xl">⚠️</div>
                    <h2 class="text-2xl font-bold text-white">Delete Comment</h2>
                </div>
                <p class="mb-6 text-gray-300 leading-relaxed">Are you sure you want to delete this comment? This action cannot be undone.</p>
                {#if deleteReplyError}
                    <div class="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">{deleteReplyError}</div>
                {/if}
                <div class="flex justify-end gap-3">
                    <button 
                        class="px-6 py-3 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors font-medium"
                        on:click={cancelDeleteReply} 
                        disabled={deleteReplySubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        class="px-6 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg disabled:opacity-50"
                        on:click={doDeleteReply} 
                        disabled={deleteReplySubmitting}
                    >
                        {deleteReplySubmitting ? '🗑️ Deleting...' : '🗑️ Delete'}
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
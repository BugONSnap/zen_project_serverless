<script lang="ts">
  import DashboardHeader from '$lib/DashboardHeader.svelte';
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  
  export let data: {
    user: { id: number; username: string; email: string; totalPoints: number; createdAt: string; userType: string | null };
    categories: { id: number; name: string; completed: number; total: number; progress: number }[];
    posts: any[];
  };

  // In-progress quiz attempts
  let inProgressAttempts: Array<any> = [];

  // Fetch in-progress attempts on mount
  import { onMount } from 'svelte';
  onMount(async () => {
    try {
      const res = await fetch('/api/profile/progress');
      if (res.ok) {
        const { attempts } = await res.json();
        inProgressAttempts = attempts || [];
      }
    } catch (e) { /* ignore */ }
  });
  
  let user: { id: number; username: string; email: string; totalPoints: number; createdAt: string; userType: string | null } = data.user;
  let categories = data.categories;
  let showDropdown = false;
  let isEditing = false;
  let newUsername = user.username;
  let showEditModal = false;
  let showDeleteModal = false;
  let fontFamily = 'poppins';
  const dispatch = createEventDispatcher();

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  function handleEditClick() {
    showEditModal = true;
    showDropdown = false;
  }

  function handleDeleteClick() {
    showDeleteModal = true;
    showDropdown = false;
  }

  async function saveUsername() {
    try {
      const response = await fetch('/api/profile/update-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername }),
      });
      
      if (response.ok) {
        const data = await response.json();
        user.username = data.user.username;
        showEditModal = false;
        isEditing = false;
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update username');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Failed to update username');
    }
  }

  async function handleDeleteProfile() {
    try {
      const response = await fetch('/api/profile/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        goto('/');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete profile');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile');
    }
  }

  function cancelEdit() {
    newUsername = user.username;
    showEditModal = false;
    isEditing = false;
  }

  // Helper functions for posts
  function getScore(post: any) {
    const likes = post.likes?.filter((l: any) => l.isLike).length || 0;
    const dislikes = post.likes?.filter((l: any) => !l.isLike).length || 0;
    return likes - dislikes;
  }

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
</script>


<div class="min-h-screen text-white font-medium relative dashboard-bg" style="background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%); overflow: visible; font-family: poppins;">
  <!-- Animated gradient overlay -->
  <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
  <!-- Subtle dot pattern -->
  <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Poppins:wght@700&display=swap');
    .dashboard-bg, body, html {
      font-family: 'Poppins', Arial, sans-serif;
      overflow: visible;
    }
    h1, h2, h3, h4, h5, h6, .dashboard-heading {
      font-family: 'Poppins', Arial, sans-serif;
      font-weight: 700;
      color: white;
    }
    p, span, small, .dashboard-body, .text-sm, .text-xs {
      font-family: 'Poppins', Arial, sans-serif;
      color: #e5e7eb;
    }
    .dashboard-heading {
      font-size: 2.5rem;
    }
    .dashboard-subheading {
      font-size: 1.5rem;
      font-family: 'Poppins', Arial, sans-serif;
      font-weight: 600;
    }
    .dashboard-stat {
      font-size: 2rem;
      font-family: 'Poppins', Arial, sans-serif;
      font-weight: 700;
    }
    .dashboard-body {
      font-size: 1.1rem;
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
    .gold-border {
      border-color: rgba(217, 119, 6, 0.3);
    }
  </style>
  <DashboardHeader title="Profile" user={user} pageName="Profile" />

  {#if showEditModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
      <div class="w-full max-w-md rounded-2xl border-2 border-amber-600 bg-black-100 p-6 shadow-2xl text-[#4a1c1c]">
        <h3 class="text-2xl font-semibold mb-4">Edit Username</h3>
        <div class="mb-4">
          <label for="username" class="block text-sm uppercase tracking-[0.3em] text-[#4a1c1c]/80 mb-2">New Username</label>
          <input
            type="text"
            id="username"
            bind:value={newUsername}
            class="w-full rounded-xl border-2 border-white/30 bg-white/70 px-3 py-2 text-[#4a1c1c] focus:outline-none focus:ring-2 focus:ring-[#ff7b7b] focus:border-transparent placeholder-[#4a1c1c]/50"
            maxlength="20"
            placeholder="Enter new username"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button class="rounded-full border-2 border-white/30 px-4 py-2 text-sm text-[#4a1c1c] hover:bg-white/60 transition-colors" on:click={cancelEdit}>
            Cancel
          </button>
          <button class="rounded-full border-2 border-[#ff7b7b] bg-[#ff7b7b] px-4 py-2 text-sm text-white hover:bg-[#ff5e5e] transition-colors" on:click={saveUsername}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if showDeleteModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
      <div class="w-full max-w-md rounded-2xl border-2 border-amber-600 bg-black/100 p-6 shadow-2xl text-[#4a1c1c]">
        <h3 class="text-2xl font-semibold text-red-600 mb-4">Delete Profile</h3>
        <p class="text-amber-600 mb-6">
          Are you sure you want to delete your profile? This action cannot be undone and all your data will be permanently deleted.
        </p>
        <div class="flex justify-end gap-2">
          <button class="rounded-full border-2 border-white/30 px-4 py-2 text-sm text-[#4a1c1c] hover:bg-black-100 transition-colors" on:click={() => showDeleteModal = false}>
            Cancel
          </button>
          <button class="rounded-full border-2 border-red-500 bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 transition-colors" on:click={handleDeleteProfile}>
            Delete Profile
          </button>
        </div>
      </div>
    </div>
  {/if}

  <div class="max-w-5xl mx-auto px-4 py-10 space-y-8">
    <section class="glass-card rounded-3xl p-8 shadow-2xl relative">
    <!-- Settings Button -->
    <button
      class="absolute top-4 right-4 text-amber-600 hover:text-amber-600 focus:outline-none transition-colors"
      on:click={toggleDropdown}
      aria-label="Settings menu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    {#if showDropdown}
      <div class="absolute top-12 right-4 w-48 rounded-2xl border-2 border-white/30 bg-transparent py-2 shadow-xl z-50">
        <button
          class="w-full text-left px-4 py-2 text-sm text-[#4a1c1c] hover:bg-transparent transition-colors"
          on:click={handleEditClick}
        >
          Edit Profile
        </button>
        <button
          class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-transparent transition-colors"
          on:click={handleDeleteClick}
        >
          Delete Profile
        </button>
      </div>
    {/if}

    <div class="flex flex-col items-center mb-6">
      <div class="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#d97706] to-[#1e40af] text-3xl font-bold text-white shadow-md">
        {user.username.charAt(0).toUpperCase()}
      </div>
      <h2 class="text-3xl font-semibold text-amber-400">{user.username}</h2>
      <p class="text-white/60">{user.email}</p>
      <!-- User type display -->
      {#if user.userType}
        <span class="mt-1 inline-block rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-300 tracking-wider uppercase">
          {user.userType}
        </span>
      {/if}
    </div>
    <p class="text-center text-amber-300/80">Track your journey, manage your identity, and jump back into unfinished work.</p>

    <div class="mt-8 text-left space-y-6">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-amber-400/70">In-progress</p>
        <h3 class="mt-1 text-2xl font-semibold text-amber-400">Current Quizzes</h3>
      </div>
      {#if inProgressAttempts.length === 0}
        <p class="rounded-2xl border-2 border-white/30 bg-white/50 p-4 text-[#4a1c1c]/80">No in-progress quizzes found.</p>
      {:else}
        <ul class="space-y-4">
          {#each inProgressAttempts as attempt}
            <li class="flex items-center justify-between rounded-2xl border-2 border-amber-400/30 bg-white/50 p-4 shadow-md">
              <span class="font-semibold text-amber-300 truncate">{attempt.title || 'Untitled Quiz'}</span>
              <span class="ml-4 rounded-full border-2 border-amber-400 bg-amber-400/20 px-3 py-1 text-xs text-amber-300 font-semibold">In Progress</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <div class="text-left space-y-4 mt-10">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-amber-400/70">Progress</p>
        <h3 class="mt-1 text-2xl font-semibold text-amber-400">Category mastery</h3>
      </div>
      {#if categories.length === 0}
        <p class="rounded-2xl border-2 border-white/30 bg-white/50 p-4 text-[#4a1c1c]/80">No categories found.</p>
      {:else}
        <ul class="space-y-4">
          {#each categories as category}
            <li class="rounded-2xl border-2 border-amber-400/30 bg-white/50 p-4 shadow-md hover:border-amber-400/50 transition-all">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-amber-300">{category.name}</span>
                <span class="text-sm text-amber-400/80">{category.completed} / {category.total} quizzes</span>
              </div>
              <div class="w-full bg-white/70 rounded-full h-2.5">
                <div class="bg-gradient-to-r from-amber-400 to-amber-600 h-2.5 rounded-full" style="width: {category.progress}%"></div>
              </div>
              <div class="text-right text-xs text-amber-400/90 mt-1 font-semibold">{category.progress}%</div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    
    <!-- Community Posts Section -->
    <div class="text-left space-y-4 mt-10">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-amber-600/70">Community</p>
        <h3 class="mt-1 text-2xl font-semibold text-amber-600">My Posts</h3>
      </div>
      {#if !data.posts || data.posts.length === 0}
        <p class="rounded-2xl border-2 border-white/30 bg-white/50 p-4 text-[#4a1c1c]/80">No posts yet. <a href="/community" class="text-amber-600 hover:underline">Create your first post!</a></p>
      {:else}
        <ul class="space-y-3">
          {#each data.posts as post}
            <li class="rounded-2xl border-2 border-amber-400/30 bg-white/50 p-4 shadow-md hover:shadow-lg hover:border-amber-400/50 transition-all">
              <div class="flex gap-3">
                <!-- Voting Score -->
                <div class="flex flex-col items-center gap-1 pt-1 min-w-[40px]">
                  <span class="text-sm font-bold {getScore(post) > 0 ? 'text-amber-400' : getScore(post) < 0 ? 'text-blue-400' : 'text-gray-400'}">
                    {getScore(post)}
                  </span>
                </div>
                
                <!-- Post Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2 text-xs text-amber-300/80">
                    <span class="font-semibold text-amber-400">r/community</span>
                    <span class="text-amber-400/60">•</span>
                    <span class="text-amber-300/70">{timeAgo(post.createdAt)}</span>
                    <span class="ml-auto flex items-center gap-1 text-amber-400">
                      {'★'.repeat(post.rating)}
                    </span>
                  </div>
                  <p class="text-amber-200 font-medium mb-2 line-clamp-2">{post.content}</p>
                  <div class="flex items-center gap-4 text-xs text-amber-300/70">
                    <span class="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.5 2.5a1 1 0 0 0-1-1h-11a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2.5l2 2 2-2H12.5a1 1 0 0 0 1-1v-9Z"/>
                      </svg>
                      {post.replies?.length || 0} {post.replies?.length === 1 ? 'comment' : 'comments'}
                    </span>
                    <a href="/community" class="text-amber-600 hover:underline">View post →</a>
                  </div>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </section>
  </div>
</div>

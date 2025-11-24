<script lang="ts">
  import DashboardHeader from '$lib/DashboardHeader.svelte';
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  
  export let data: {
    user: { id: number; username: string; email: string; totalPoints: number; createdAt: string };
    categories: { id: number; name: string; completed: number; total: number; progress: number }[];
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
  
  let user = data.user;
  let categories = data.categories;
  let showDropdown = false;
  let isEditing = false;
  let newUsername = user.username;
  let showEditModal = false;
  let showDeleteModal = false;
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
</script>

<div class="min-h-screen bg-gradient-to-b from-[#FF0606] via-[#6F1414] to-[#050202] text-white">
  <DashboardHeader title="Profile" user={user} />

  {#if showEditModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
      <div class="w-full max-w-md rounded-2xl border border-white/10 bg-black/60 p-6 shadow-2xl text-white">
        <h3 class="text-2xl font-semibold mb-4">Edit Username</h3>
        <div class="mb-4">
          <label for="username" class="block text-sm uppercase tracking-[0.3em] text-white/60 mb-2">New Username</label>
          <input
            type="text"
            id="username"
            bind:value={newUsername}
            class="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            maxlength="20"
            placeholder="Enter new username"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button class="rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-white/40" on:click={cancelEdit}>
            Cancel
          </button>
          <button class="rounded-full border border-emerald-400/70 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-400/10" on:click={saveUsername}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if showDeleteModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
      <div class="w-full max-w-md rounded-2xl border border-red-400/40 bg-black/60 p-6 shadow-2xl text-white">
        <h3 class="text-2xl font-semibold text-red-200 mb-4">Delete Profile</h3>
        <p class="text-white/80 mb-6">
          Are you sure you want to delete your profile? This action cannot be undone and all your data will be permanently deleted.
        </p>
        <div class="flex justify-end gap-2">
          <button class="rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-white/40" on:click={() => showDeleteModal = false}>
            Cancel
          </button>
          <button class="rounded-full border border-red-400/70 px-4 py-2 text-sm text-red-100 hover:bg-red-500/10" on:click={handleDeleteProfile}>
            Delete Profile
          </button>
        </div>
      </div>
    </div>
  {/if}

  <div class="max-w-5xl mx-auto px-4 py-10 space-y-8">
    <section class="rounded-3xl border border-white/15 bg-black/30 p-8 shadow-2xl backdrop-blur relative">
    <!-- Settings Button -->
    <button
      class="absolute top-4 right-4 text-white/70 hover:text-white focus:outline-none"
      on:click={toggleDropdown}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    {#if showDropdown}
      <div class="absolute top-12 right-4 w-48 rounded-2xl border border-white/10 bg-black/80 py-2 shadow-xl">
        <button
          class="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          on:click={handleEditClick}
        >
          Edit Profile
        </button>
        <button
          class="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-white/10"
          on:click={handleDeleteClick}
        >
          Delete Profile
        </button>
      </div>
    {/if}

    <div class="flex flex-col items-center mb-6">
      <div class="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-3xl font-bold text-white">
        {user.username.charAt(0).toUpperCase()}
      </div>
      <h2 class="text-3xl font-semibold text-white">{user.username}</h2>
      <p class="text-white/60">{user.email}</p>
    </div>
    <p class="text-center text-white/70">Track your journey, manage your identity, and jump back into unfinished work.</p>

    <div class="mt-8 text-left space-y-6">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-white/60">In-progress</p>
        <h3 class="mt-1 text-2xl font-semibold text-white">Current Quizzes</h3>
      </div>
      {#if inProgressAttempts.length === 0}
        <p class="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">No in-progress quizzes found.</p>
      {:else}
        <ul class="space-y-4">
          {#each inProgressAttempts as attempt}
            <li class="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-4 shadow-inner">
              <span class="font-semibold text-white truncate">{attempt.title || 'Untitled Quiz'}</span>
              <span class="ml-4 rounded-full border border-amber-300/60 px-3 py-1 text-xs text-amber-100">In Progress</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <div class="text-left space-y-4 mt-10">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-white/60">Progress</p>
        <h3 class="mt-1 text-2xl font-semibold text-white">Category mastery</h3>
      </div>
      {#if categories.length === 0}
        <p class="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">No categories found.</p>
      {:else}
        <ul class="space-y-4">
          {#each categories as category}
            <li class="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-white">{category.name}</span>
                <span class="text-sm text-white/60">{category.completed} / {category.total} quizzes</span>
              </div>
              <div class="w-full bg-white/10 rounded-full h-2">
                <div class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full" style={`width: ${category.progress}%`}></div>
              </div>
              <div class="text-right text-xs text-white/60 mt-1">{category.progress}%</div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>

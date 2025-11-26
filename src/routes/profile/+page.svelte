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

<div class="min-h-screen bg-gradient-to-b from-[#ffbdbd] via-[#ff9b9b] to-[#ff7b7b] text-[#4a1c1c] font-medium">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Poppins:wght@700&display=swap');
    
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Poppins', Arial, sans-serif;
    }
    
    body {
      font-family: 'Montserrat', Arial, sans-serif;
    }
  </style>
  <DashboardHeader title="Profile" user={user} />

  {#if showEditModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
      <div class="w-full max-w-md rounded-2xl border-2 border-white/30 bg-gradient-to-br from-[#ffb0b0] to-[#ffd4d4] p-6 shadow-2xl text-[#4a1c1c]">
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
      <div class="w-full max-w-md rounded-2xl border-2 border-red-300 bg-white p-6 shadow-2xl text-[#4a1c1c]">
        <h3 class="text-2xl font-semibold text-red-600 mb-4">Delete Profile</h3>
        <p class="text-[#4a1c1c]/80 mb-6">
          Are you sure you want to delete your profile? This action cannot be undone and all your data will be permanently deleted.
        </p>
        <div class="flex justify-end gap-2">
          <button class="rounded-full border-2 border-white/30 px-4 py-2 text-sm text-[#4a1c1c] hover:bg-gray-100 transition-colors" on:click={() => showDeleteModal = false}>
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
    <section class="rounded-3xl border-2 border-white/30 bg-gradient-to-br from-[#ffb0b0] to-[#ffd4d4] p-8 shadow-2xl relative">
    <!-- Settings Button -->
    <button
      class="absolute top-4 right-4 text-[#4a1c1c]/70 hover:text-[#4a1c1c] focus:outline-none transition-colors"
      on:click={toggleDropdown}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    {#if showDropdown}
      <div class="absolute top-12 right-4 w-48 rounded-2xl border-2 border-white/30 bg-white/90 py-2 shadow-xl z-50">
        <button
          class="w-full text-left px-4 py-2 text-sm text-[#4a1c1c] hover:bg-[#ffd4d4] transition-colors"
          on:click={handleEditClick}
        >
          Edit Profile
        </button>
        <button
          class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors"
          on:click={handleDeleteClick}
        >
          Delete Profile
        </button>
      </div>
    {/if}

    <div class="flex flex-col items-center mb-6">
      <div class="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b7b] to-[#ff5e5e] text-3xl font-bold text-white shadow-md">
        {user.username.charAt(0).toUpperCase()}
      </div>
      <h2 class="text-3xl font-semibold text-white">{user.username}</h2>
      <p class="text-white/60">{user.email}</p>
    </div>
    <p class="text-center text-[#4a1c1c]/80">Track your journey, manage your identity, and jump back into unfinished work.</p>

    <div class="mt-8 text-left space-y-6">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-[#4a1c1c]/70">In-progress</p>
        <h3 class="mt-1 text-2xl font-semibold text-[#4a1c1c]">Current Quizzes</h3>
      </div>
      {#if inProgressAttempts.length === 0}
        <p class="rounded-2xl border-2 border-white/30 bg-white/50 p-4 text-[#4a1c1c]/80">No in-progress quizzes found.</p>
      {:else}
        <ul class="space-y-4">
          {#each inProgressAttempts as attempt}
            <li class="flex items-center justify-between rounded-2xl border-2 border-white/30 bg-white/50 p-4 shadow-md">
              <span class="font-semibold text-[#4a1c1c] truncate">{attempt.title || 'Untitled Quiz'}</span>
              <span class="ml-4 rounded-full border-2 border-[#ff7b7b] bg-white/80 px-3 py-1 text-xs text-[#4a1c1c]">In Progress</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <div class="text-left space-y-4 mt-10">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-[#4a1c1c]/70">Progress</p>
        <h3 class="mt-1 text-2xl font-semibold text-[#4a1c1c]">Category mastery</h3>
      </div>
      {#if categories.length === 0}
        <p class="rounded-2xl border-2 border-white/30 bg-white/50 p-4 text-[#4a1c1c]/80">No categories found.</p>
      {:else}
        <ul class="space-y-4">
          {#each categories as category}
            <li class="rounded-2xl border-2 border-white/30 bg-white/50 p-4 shadow-md">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-[#4a1c1c]">{category.name}</span>
                <span class="text-sm text-[#4a1c1c]/80">{category.completed} / {category.total} quizzes</span>
              </div>
              <div class="w-full bg-white/70 rounded-full h-2.5">
                <div class="bg-gradient-to-r from-[#ff7b7b] to-[#ff5e5e] h-2.5 rounded-full" style="width: {category.progress}%"></div>
              </div>
              <div class="text-right text-xs text-[#4a1c1c]/80 mt-1">{category.progress}%</div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>

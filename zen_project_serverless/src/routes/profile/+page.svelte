<script lang="ts">
  import DashboardHeader from '$lib/DashboardHeader.svelte';
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  
  export let data: {
    user: { id: number; username: string; email: string; totalPoints: number; createdAt: string };
    categories: { id: number; name: string; completed: number; total: number; progress: number }[];
  };
  
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

<DashboardHeader user={user} />

<!-- Edit Username Modal -->
{#if showEditModal}
  <div class="fixed inset-0 flex items-center justify-center z-50">
    <div class="bg-[#f8f8f87c] rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
      <h3 class="text-xl font-bold mb-4">Edit Username</h3>
      <div class="mb-4">
        <label for="username" class="block text-sm font-medium text-gray-700 mb-2">New Username</label>
        <input
          type="text"
          id="username"
          bind:value={newUsername}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          maxlength="20"
          placeholder="Enter new username"
        />
      </div>
      <div class="flex justify-end gap-2">
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          on:click={cancelEdit}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          on:click={saveUsername}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Profile Modal -->
{#if showDeleteModal}
  <div class="fixed inset-0 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
      <h3 class="text-xl font-bold mb-4 text-red-600">Delete Profile</h3>
      <p class="text-gray-700 mb-6">
        Are you sure you want to delete your profile? This action cannot be undone and all your data will be permanently deleted.
      </p>
      <div class="flex justify-end gap-2">
        <button
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          on:click={() => showDeleteModal = false}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          on:click={handleDeleteProfile}
        >
          Delete Profile
        </button>
      </div>
    </div>
  </div>
{/if}

<div class="min-h-screen bg-cover bg-center flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style="background-image: url('/BG.jpg');">
  <div class="bg-[#fff2f2ba] p-8 rounded-lg shadow-md w-full max-w-md text-center relative">
    <!-- Settings Button -->
    <button
      class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
      on:click={toggleDropdown}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    {#if showDropdown}
      <div class="absolute top-12 right-4 bg-white rounded-lg shadow-lg py-2 w-48 z-10">
        <button
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          on:click={handleEditClick}
        >
          Edit Profile
        </button>
        <button
          class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          on:click={handleDeleteClick}
        >
          Delete Profile
        </button>
      </div>
    {/if}

    <div class="flex flex-col items-center mb-6">
      <div class="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-3xl font-bold text-white mb-2">
        {user.username.charAt(0).toUpperCase()}
      </div>
      <h2 class="text-2xl font-bold mb-1">{user.username}</h2>
      <p class="text-gray-500">{user.email}</p>
    </div>
    <p class="text-gray-700 mb-6">Welcome to your profile page!</p>
    <div class="text-left">
      <h3 class="text-lg font-semibold mb-2">Category Progress</h3>
      {#if categories.length === 0}
        <p class="text-gray-500">No categories found.</p>
      {:else}
        <ul class="space-y-4">
          {#each categories as category}
            <li>
              <div class="flex justify-between items-center mb-1">
                <span class="font-medium">{category.name}</span>
                <span class="text-sm text-gray-500">{category.completed} / {category.total} quizzes</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-indigo-500 h-2 rounded-full" style="width: {category.progress}%"></div>
              </div>
              <div class="text-right text-xs text-gray-500 mt-1">{category.progress}%</div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>

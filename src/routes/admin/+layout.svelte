<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  // Handle logout
  async function handleLogout() {
    // Call server-side logout endpoint
    await fetch('/api/logout', { method: 'POST' });
    // Clear cookies client-side as a fallback
    document.cookie = "session=; path=/; max-age=0";
    document.cookie = "isAdmin=; path=/; max-age=0";
    goto("/");
  }
</script>

<div style="background-image: url('/BG.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat;" class="min-h-screen flex flex-col">  <!-- Admin Header -->
  <!-- Admin Header -->
  <header class="bg-indigo-600 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
    <button
      class="text-2xl font-bold font-serif bg-transparent border-none cursor-pointer focus:outline-none"
      on:click={() => goto('/admin')}
      type="button"
    >
      Zentry Admin
    </button>
      <nav class="flex space-x-4">
        <a href="/admin/users" class="hover:text-indigo-200 transition-colors">Users</a>
        <a href="/admin/quizzes" class="hover:text-indigo-200 transition-colors">Quizzes</a>
        <a href="/admin/analytics" class="hover:text-indigo-200 transition-colors">Analytics</a>
        <button
          on:click={handleLogout}
          class="hover:text-indigo-200 transition-colors focus:outline-none"
        >
          Logout
        </button>
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <slot />
  </main>

  <!-- Footer (Optional) -->
  <footer class="bg-gray-800 text-white py-4">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p>&copy; 2025 Zentry Admin. All rights reserved.</p>
    </div>
  </footer>
</div>

<style>
  /* Add component-specific styles here if needed */

</style>
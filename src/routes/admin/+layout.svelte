<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let showMenu = false;

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

<div style="background-image: url('/BG.jpg');bac;background-clip: unset; background-attachment: fixed;background-size: cover    background-attachment: fixed;
background-size: cover;
background-position: center;
background-repeat: no-repeat;
">
  <!-- Admin Header -->
  <header class="bg-indigo-600 text-white shadow-md" style="background-color: #50c5c1ab;">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
    <button
      class="text-2xl font-bold font-serif bg-transparent border-none cursor-pointer focus:outline-none"
      on:click={() => goto('/admin')}
      type="button"
    >
      Zentry Admin
    </button>
      <!-- Responsive Nav -->
      <nav class="hidden md:flex space-x-4">
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
      <!-- Hamburger for mobile -->
      <div class="md:hidden relative">
        <button class="p-2 rounded focus:outline-none focus:ring-2 focus:ring-white" on:click={() => showMenu = !showMenu} aria-label="Open navigation menu">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        {#if showMenu}
          <div class="absolute right-0 mt-2 w-48 bg-white text-indigo-700 rounded shadow-lg z-50 animate-fade-in">
            <a href="/admin/users" class="block px-4 py-2 hover:bg-indigo-100" on:click={() => showMenu = false}>Users</a>
            <a href="/admin/quizzes" class="block px-4 py-2 hover:bg-indigo-100" on:click={() => showMenu = false}>Quizzes</a>
            <a href="/admin/analytics" class="block px-4 py-2 hover:bg-indigo-100" on:click={() => showMenu = false}>Analytics</a>
            <button on:click={() => { showMenu = false; handleLogout(); }} class="block w-full text-left px-4 py-2 hover:bg-indigo-100">Logout</button>
          </div>
        {/if}
      </div>
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
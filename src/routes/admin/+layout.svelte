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

<div class="min-h-screen bg-gradient-to-b from-[#FF0606] via-[#6F1414] to-[#050202] flex flex-col">
  <!-- Admin Header, Main Content, Footer will render inside -->
  <header class="shadow-2xl sticky top-0 z-50 transition-colors duration-300 bg-gradient-to-r from-[#FF0606] via-[#6F1414] to-[#050202] text-white bg-white/10 backdrop-blur-xl border border-white/15 w-full">
    <div class="max-w-7xl mx-auto py-2 px-2 sm:px-4 lg:px-8 flex justify-between items-center">
      <button type="button" class="text-3xl font-bold text-white font-serif bg-transparent border-none cursor-pointer focus:outline-none hover:underline" on:click={() => goto('/admin')} aria-label="Go to Admin Home">
        Zentry Admin
      </button>
      <!-- Desktop nav -->
      <div class="hidden md:flex items-center space-x-4">
        <a href="/admin" class="text-white text-sm font-medium hover:underline focus:outline-none">Home</a>
        <a href="/admin/users" class="text-white text-sm font-medium hover:underline focus:outline-none">Users</a>
        <a href="/admin/quizzes" class="text-white text-sm font-medium hover:underline focus:outline-none">Quizzes</a>
        <a href="/admin/analytics" class="text-white text-sm font-medium hover:underline focus:outline-none">Analytics</a>
        <button class="text-white text-sm font-medium hover:underline focus:outline-none" on:click={handleLogout}>Logout</button>
      </div>
      <!-- Mobile/Tablet nav -->
      <div class="md:hidden relative">
        <button
          class="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          on:click={() => { showMenu = !showMenu; }}
          aria-label="Open menu"
        >
          <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {#if showMenu}
          <div class="absolute right-0 mt-2 w-48 bg-black/90 rounded-xl shadow-2xl z-50 py-2 border border-white/10 backdrop-blur-xl">
            <a href="/admin" class="block px-4 py-2 text-sm text-white hover:text-emerald-300" on:click={() => showMenu = false}>Home</a>
            <a href="/admin/users" class="block px-4 py-2 text-sm text-white hover:text-emerald-300" on:click={() => showMenu = false}>Users</a>
            <a href="/admin/quizzes" class="block px-4 py-2 text-sm text-white hover:text-emerald-300" on:click={() => showMenu = false}>Quizzes</a>
            <a href="/admin/analytics" class="block px-4 py-2 text-sm text-white hover:text-emerald-300" on:click={() => showMenu = false}>Analytics</a>
            <button class="block w-full text-left px-4 py-2 text-sm text-white hover:text-emerald-300" on:click={() => { handleLogout(); showMenu = false; }}>Logout</button>
          </div>
        {/if}
      </div>
    </div>
  </header>
  <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <slot />
  </main>
  <footer class="rounded-b-3xl border-t border-white/10 bg-black/50 shadow-2xl backdrop-blur py-4 mt-8 text-center text-white/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p>&copy; 2025 Zentry Admin. All rights reserved.</p>
    </div>
  </footer>
</div>

<style>
  /* Add component-specific styles here if needed */

</style>
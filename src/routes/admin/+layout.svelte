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

<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Poppins:wght@700&display=swap');

  body, html {
    font-family: 'Poppins', Arial, sans-serif;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', Arial, sans-serif;
    font-weight: 700;
    color: white;
  }
  p, span, small, .text-sm, .text-xs {
    font-family: 'Montserrat', Arial, sans-serif;
    color: #e5e7eb;
  }
  .dashboard-heading {
    font-size: 2.5rem;
  }
  .dashboard-subheading {
    font-size: 1.5rem;
    font-family: 'Montserrat', Arial, sans-serif;
    font-weight: 600;
  }
  
  .admin-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Poppins', Arial, sans-serif;
    font-weight: 500;
    position: relative;
    overflow-x: hidden;
    color: #e5e7eb;
    background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%);
  }
  .admin-layout::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.05;
    background-image: radial-gradient(#d97706 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
  }
  .admin-header {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    position: sticky;
    top: 0;
    z-index: 50;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
    background: linear-gradient(to right, #1a1f2e 0%, #111827 50%, #0f172a 100%);
    color: white;
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(217, 119, 6, 0.2);
    width: 100%;
  }
  .admin-footer {
    margin-top: auto;
    border-top: 1px solid rgba(217, 119, 6, 0.25);
    background: linear-gradient(to right, #111827 0%, #0f172a 50%, #111827 100%);
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(20px);
    padding: 1.25rem 0;
    text-align: center;
    color: rgba(229, 231, 235, 0.85);
    position: relative;
    z-index: 10;
  }
  .admin-footer p {
    margin: 0;
    font-size: 0.875rem;
    letter-spacing: 0.02em;
  }
  .btn-primary {
    background-color: #d97706;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: background-color 0.2s;
  }
  .btn-primary:hover {
    background-color: #f59e0b;
  }
  .nav-link {
    color: white;
    font-size: 1rem;
    font-weight: 600;
    transition: color 0.2s;
  }
  .nav-link:hover {
    color: #d97706;
    text-decoration: underline;
  }
  :global(.admin-select),
  :global(select.admin-select) {
    background-color: #1f2937;
    color: #f3f4f6;
    border: 1px solid rgba(217, 119, 6, 0.35);
    border-radius: 0.5rem;
    cursor: pointer;
  }
  :global(.admin-select:hover),
  :global(select.admin-select:hover) {
    border-color: rgba(217, 119, 6, 0.6);
    background-color: #374151;
  }
  :global(.admin-select:focus),
  :global(select.admin-select:focus) {
    outline: none;
    border-color: #d97706;
    box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.35);
  }
  :global(.admin-select option),
  :global(select.admin-select option) {
    background-color: #1f2937;
    color: #f3f4f6;
  }
</style>

<div class="admin-layout">
  <div class="absolute inset-0 opacity-20 pointer-events-none" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
  <header class="admin-header relative z-10">
    <div class="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <button 
        type="button" 
        class="text-3xl font-bold text-white bg-transparent border-none cursor-pointer focus:outline-none hover:text-amber-400 transition font-['Poppins']" 
        on:click={() => goto('/admin')} 
        aria-label="Go to Admin Home"
      >
        Zentry Admin
      </button>
      <!-- Desktop nav -->
      <div class="hidden md:flex items-center space-x-8">
        <a href="/admin" class="nav-link">Home</a>
        <a href="/admin/users" class="nav-link">Users</a>
        <a href="/admin/quizzes" class="nav-link">Quizzes</a>
        <a href="/admin/admin_community" class="nav-link">Community</a>
        <a href="/admin/analytics" class="nav-link">Analytics</a>
        <button class="btn-primary" on:click={handleLogout}>Logout</button>
      </div>
      <!-- Mobile/Tablet nav -->
      <div class="md:hidden relative">
        <button
          class="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d97706]"
          on:click={() => { showMenu = !showMenu; }}
          aria-label="Open menu"
        >
          <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {#if showMenu}
          <div class="absolute right-0 mt-2 w-56 bg-gray-900/95 rounded-xl shadow-2xl z-50 py-2 border border-gray-700 backdrop-blur-xl">
            <a href="/admin" class="block px-6 py-3 text-base text-white hover:bg-gray-800 hover:text-amber-400 transition-colors" on:click={() => showMenu = false}>Home</a>
            <a href="/admin/users" class="block px-6 py-3 text-base text-white hover:bg-gray-800 hover:text-amber-400 transition-colors" on:click={() => showMenu = false}>Users</a>
            <a href="/admin/quizzes" class="block px-6 py-3 text-base text-white hover:bg-gray-800 hover:text-amber-400 transition-colors" on:click={() => showMenu = false}>Quizzes</a>
            <a href="/admin/admin_community" class="block px-6 py-3 text-base text-white hover:bg-gray-800 hover:text-amber-400 transition-colors" on:click={() => showMenu = false}>Community</a>
            <a href="/admin/analytics" class="block px-6 py-3 text-base text-white hover:bg-gray-800 hover:text-amber-400 transition-colors" on:click={() => showMenu = false}>Analytics</a>
            <button class="block w-full text-left px-6 py-3 text-base text-white hover:bg-gray-800 hover:text-amber-400 transition-colors" on:click={() => { handleLogout(); showMenu = false; }}>Logout</button>
          </div>
        {/if}
      </div>
    </div>
  </header>
  <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
    <slot />
  </main>
  <footer class="admin-footer w-full">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p>&copy; 2025 Zentry Admin. All rights reserved.</p>
    </div>
  </footer>
</div>

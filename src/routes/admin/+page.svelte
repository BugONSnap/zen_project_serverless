<script lang="ts">
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";

  export let data: PageData;

  const { isAuthorized, username, error } = data;
</script>

{#if data.loading}
  <div class="text-center py-12">
    <p class="text-lg font-semibold text-gray-700">Loading...</p>
  </div>
{:else if error}
  <div class="text-center py-12">
    <p class="text-red-500 font-semibold">{error}</p>
  </div>
{:else if isAuthorized}
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
    <p class="text-gray-600">
      Welcome, {username || "Admin"}! Manage users, quizzes, and settings below.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Manage Users</h2>
        <p class="text-gray-600 mb-4">View, edit, or delete user accounts.</p>
        <a
          href="/admin/users"
          class="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-800 transition-colors"
        >
          Go to User Management
        </a>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Manage Quizzes</h2>
        <p class="text-gray-600 mb-4">Create, update, or delete quizzes.</p>
        <a
          href="/admin/quizzes"
          class="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-800 transition-colors"
        >
          Go to Quiz Management
        </a>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Analytics</h2>
        <p class="text-gray-600 mb-4">Check out the System Analytics </p>
        <a
          href="/admin/analytics"
          class="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-800 transition-colors"
        >
          Go to Analytics
        </a>
      </div>
    </div>
  </div>
{:else}
  <!-- Redirect handled server-side, but keep this as fallback -->
  <div class="text-center py-12">
    <p class="text-red-500 font-semibold">Access denied. Redirecting to login...</p>
  </div>
{/if}
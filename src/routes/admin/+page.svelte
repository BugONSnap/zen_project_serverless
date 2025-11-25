<script lang="ts">
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";

  export let data: PageData;

  const { isAuthorized, username, error } = data;
</script>

{#if data.loading}
  <div class="flex justify-center items-center min-h-[60vh]">
    <div class="border border-emerald-400 bg-emerald-600/10 text-emerald-100 px-8 py-5 rounded-2xl shadow-xl text-lg font-semibold text-center">
      Loading...
    </div>
  </div>
{:else if error}
  <div class="flex justify-center items-center min-h-[60vh]">
    <div class="border border-red-400 bg-red-700/20 text-red-100 px-8 py-5 rounded-2xl shadow-xl text-lg font-semibold text-center">
      {error}
    </div>
  </div>
{:else if isAuthorized}
  <div class="flex justify-center items-center min-h-[80vh]">
    <div class="w-full max-w-4xl rounded-3xl border border-white/10 bg-black/30 shadow-2xl backdrop-blur p-10">
      <div class="space-y-4 text-center mb-14">
        <h1 class="text-5xl font-bold text-white">Admin Dashboard</h1>
        <p class="text-white/70 text-xl">
          Welcome, {username || "Admin"}! Manage users, quizzes, and settings below.
        </p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">

        <div class="rounded-2xl border border-white/10 bg-black/40 shadow-xl hover:border-emerald-400/70 transition px-8 py-7">
          <h2 class="text-2xl font-semibold text-white mb-3">Manage Users</h2>
          <p class="text-white/70 mb-4">View, edit, or delete user accounts.</p>
          <a
            href="/admin/users"
            class="inline-block bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow font-semibold"
          >
            Go to User Management
          </a>
        </div>
        <div class="rounded-2xl border border-white/10 bg-black/40 shadow-xl hover:border-emerald-400/70 transition px-8 py-7">
          <h2 class="text-2xl font-semibold text-white mb-3">Manage Quizzes</h2>
          <p class="text-white/70 mb-4">Create, update, or delete quizzes.</p>
          <a
            href="/admin/quizzes"
            class="inline-block bg-emerald-600/80 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow font-semibold"
          >
            Go to Quiz Management
          </a>
        </div>
        <div class="rounded-2xl border border-white/10 bg-black/40 shadow-xl hover:border-amber-400/70 transition px-8 py-7">
          <h2 class="text-2xl font-semibold text-white mb-3">Analytics</h2>
          <p class="text-white/70 mb-4">Check out the System Analytics </p>
          <a
            href="/admin/analytics"
            class="inline-block bg-amber-500/90 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors shadow font-semibold"
          >
            Go to Analytics
          </a>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="flex justify-center items-center min-h-[60vh]">
    <div class="border border-amber-300 bg-amber-900/10 text-amber-100 px-8 py-5 rounded-2xl shadow-xl text-lg font-semibold text-center">
      Access denied. Redirecting to login...
    </div>
  </div>
{/if}
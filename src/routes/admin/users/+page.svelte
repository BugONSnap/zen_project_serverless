<script lang="ts">
  import type { PageData } from "./$types";
  import { enhance } from "$app/forms";

  export let data: PageData;

  const { users, loading, error, currentUserAdminLevel } = data;
  let successMessage = "";
  let actionError = "";

  // Reset messages after 3 seconds
  $: if (successMessage || actionError) {
    setTimeout(() => {
      successMessage = "";
      actionError = "";
    }, 3000);
  }

  // Parse progress string into an array of { category, percentage }
  function parseProgress(progress: string) {
    if (progress === "No progress") return [];
    return progress.split(", ").map(item => {
      const [category, percentage] = item.split(": ");
      return { category, percentage: parseInt(percentage) };
    });
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Poppins:wght@700&display=swap');

  .dashboard-bg, body, html {
    font-family: 'Montserrat', Arial, sans-serif;
  }
  h1, h2, h3, h4, h5, h6, .dashboard-heading {
    font-family: 'Poppins', Arial, sans-serif;
    font-weight: 700;
  }
  p, span, small, .dashboard-body, .text-sm, .text-xs {
    font-family: 'Montserrat', Arial, sans-serif;
  }
  .dashboard-heading {
    font-size: 2.5rem;
  }
  .dashboard-subheading {
    font-size: 1.5rem;
    font-family: 'Montserrat', Arial, sans-serif;
    font-weight: 600;
  }
  .dashboard-stat {
    font-size: 2rem;
    font-family: 'Poppins', Arial, sans-serif;
    font-weight: 700;
  }
  .dashboard-body {
    font-size: 1.1rem;
    font-family: 'Montserrat', Arial, sans-serif;
  }
  
  /* Progress bar styles */
  .progress-bar {
    height: 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.2);
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff7b7b 0%, #ff4d4d 100%);
    border-radius: 4px;
  }
  
  /* Tablet and mobile styles */
  @media (max-width: 1024px) {
    .user-card {
      background: rgba(74, 28, 28, 0.2);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid rgba(74, 28, 28, 0.1);
      max-width: 100%;
      overflow: hidden;
    }
    
    .card-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .card-label {
      font-weight: 600;
      color: rgba(74, 28, 28, 0.8);
    }
    
    .card-value {
      color: #4a1c1c;
    }
  }
</style>

{#if loading}
  <div class="text-center py-12">
    <p class="text-lg font-semibold text-[#4a1c1c]">Loading...</p>
  </div>
{:else if error}
  <div class="text-center py-12">
    <p class="text-red-500 font-semibold">{error}</p>
  </div>
{:else}
  <main class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <section class="rounded-3xl border-2 border-[#4a1c1c]/30 p-8 shadow-lg backdrop-blur" style="background:linear-gradient(to right, #ffbdbd 0%, #ff9b9b 50%, #ff7b7b 100%);">
      <div class="text-center space-y-2 mb-8">
        <p class="text-xs uppercase tracking-[0.35em] text-[#7a2a2a]">Administration</p>
        <h1 class="text-3xl font-bold text-[#4a1c1c] dashboard-heading">User Management</h1>
        <p class="text-[#7a2a2a]">View and manage all users, their roles, and progress across categories.</p>
      </div>
    {#if successMessage}
      <div class="bg-green-500/20 border border-green-600/30 text-[#4a1c1c] px-6 py-3 rounded-xl mb-6 backdrop-blur flex items-center justify-center" role="alert">
        <span class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium">{successMessage}</span>
        </span>
      </div>
    {/if}
    {#if actionError}
      <div class="bg-red-500/20 border border-red-600/30 text-red-800 px-6 py-3 rounded-xl mb-6 backdrop-blur flex items-center justify-center" role="alert">
        <span class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium">{actionError}</span>
        </span>
      </div>
    {/if}
    {#if users.length === 0}
      <p class="text-gray-500">No users found.</p>
    {:else}
      <!-- Desktop Table (hidden on tablets and mobile) -->
      <div class="hidden lg:block bg-white/30 backdrop-blur-sm rounded-2xl p-1 w-full">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[900px] lg:min-w-0">
            <thead>
            <tr class="bg-white/20">
              <th class="py-3 px-4 text-left text-xs font-medium text-[#4a1c1c] uppercase tracking-wider whitespace-nowrap">Username</th>
              <th class="py-3 px-4 text-left text-xs font-medium text-[#4a1c1c]/80 whitespace-nowrap">Email</th>
              <th class="py-3 px-4 text-left text-xs font-medium text-[#4a1c1c]/80 whitespace-nowrap">Role</th>
              <th class="py-3 px-4 text-left text-xs font-medium text-[#4a1c1c]/80 whitespace-nowrap">Rank</th>
              <th class="py-3 px-4 text-left text-xs font-medium text-[#4a1c1c]/80 whitespace-nowrap">Progress</th>
              {#if currentUserAdminLevel === 0}
                <th class="py-3 px-4 text-left text-xs font-medium text-[#4a1c1c]/80 whitespace-nowrap">Actions</th>
              {/if}
            </tr>
          </thead>
          <tbody>
            {#each users as user, index}
              <tr class="border-b border-[#4a1c1c]/5 hover:bg-[#4a1c1c]/5 transition-colors">
                <td class="py-3 px-4 text-[#4a1c1c]/90 whitespace-nowrap">
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="w-7 h-7 rounded-full bg-[#4a1c1c]/10 flex-shrink-0 flex items-center justify-center">
                      <span class="text-xs text-[#4a1c1c]">{user.username[0].toUpperCase()}</span>
                    </div>
                    <span class="truncate max-w-[120px] text-[#4a1c1c]">{user.username}</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-[#4a1c1c]/80 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">{user.email}</td>
                <td class="py-3 px-4 whitespace-nowrap">
                  {#if currentUserAdminLevel === 0 && user.adminLevel !== 0}
                    <!-- Dropdown for non-super-admin users -->
                    <form
                      use:enhance={({ formElement }) => {
                        return async ({ result }) => {
                          if (result.type === "success" && result.data?.success) {
                            successMessage = typeof result.data.message === "string" ? result.data.message : "";
                          } else if (result.type === "failure") {
                            actionError = typeof result.data?.error === "string"
                              ? result.data.error
                              : (result.data?.error ? JSON.stringify(result.data.error) : "Failed to update role");
                          }
                        };
                      }}
                      method="POST"
                      action="?/changeRole"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="adminLevel"
                        value={user.adminLevel.toString()}
                        class="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        on:change={(e) => {
                          const target = e.target as HTMLSelectElement | null;
                          if (target && target.form) {
                            target.form.requestSubmit();
                          }
                        }}
                      >
                        <option value="1" selected={user.adminLevel === 1}>Admin</option>
                        <option value="2" selected={user.adminLevel === 2}>User</option>
                      </select>
                    </form>
                  {:else}
                    <!-- Display role as plain text for super admins or non-super-admin viewers -->
                    {user.role}
                  {/if}
                </td>
                <td class="py-3 px-4">
                  <span class="inline-block bg-[#4a1c1c]/10 text-[#4a1c1c]/90 px-2 py-0.5 rounded-full text-xs">
                    {user.rankName || "No Rank"}
                  </span>
                </td>
                <td class="py-3 px-4 w-[200px]">
                  <div class="space-y-1.5">
                    {#each parseProgress(user.progress) as progressItem, i}
                      <div class="space-y-0.5" key="{user.id}-{i}">
                        <div class="flex justify-between text-xs text-[#4a1c1c]/80">
                          <span class="truncate max-w-[100px]">{progressItem.category}</span>
                          <span class="font-medium">{progressItem.percentage}%</span>
                        </div>
                        <div class="w-full bg-[#4a1c1c]/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
                            style="width: {progressItem.percentage}%"
                          ></div>
                        </div>
                      </div>
                    {/each}
                    {#if parseProgress(user.progress).length === 0}
                      <span class="text-[#4a1c1c]/50 italic text-xs">No progress</span>
                    {/if}
                  </div>
                </td>
                {#if currentUserAdminLevel === 0}
                  <td class="py-3 px-4 whitespace-nowrap">
                    <form
                      use:enhance={({ formElement }) => {
                        return async ({ result }) => {
                          if (result.type === "success" && result.data?.success) {
                            successMessage = typeof result.data.message === "string" ? result.data.message : "";
                          } else if (result.type === "failure") {
                            actionError = typeof result.data?.error === "string"
                              ? result.data.error
                              : (result.data?.error ? JSON.stringify(result.data.error) : "Failed to delete user");
                          }
                        };
                      }}
                      method="POST"
                      action="?/deleteUser"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        class="flex items-center justify-center gap-1.5 bg-red-500/20 border border-red-400/30 text-[#4a1c1c] px-3 py-1 rounded-lg hover:bg-red-500/30 transition-colors text-sm whitespace-nowrap w-full"
                        on:click={(e) => {
                          if (!confirm('Are you sure you want to delete this user?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </form>
                  </td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    <!-- Tablet and Mobile Cards -->
    <div class="lg:hidden space-y-4">
      {#each users as user}
        <div class="user-card">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3 mb-2">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-[#4a1c1c]/20 flex items-center justify-center text-[#4a1c1c]/90 font-bold text-lg">
                {user.username[0].toUpperCase()}
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-[#4a1c1c]">{user.username}</h3>
                <p class="text-sm text-[#7a2a2a]">{user.email}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="card-row">
                <span class="card-label">Role:</span>
                <span class="card-value">{user.role}</span>
              </div>
              <div class="card-row">
                <span class="card-label">Rank:</span>
                <span class="card-value">{user.rank || 'Beginner'}</span>
              </div>
            </div>
            <div class="space-y-3 pt-3 border-t border-[#4a1c1c]/10">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-[#4a1c1c]/70">Role:</span>
                <span>
                  {#if currentUserAdminLevel === 0 && user.adminLevel !== 0}
                    <form
                      use:enhance={({ formElement }) => {
                        return async ({ result }) => {
                          if (result.type === "success" && result.data?.success) {
                            successMessage = typeof result.data.message === "string" ? result.data.message : "";
                          } else if (result.type === "failure") {
                            actionError = typeof result.data?.error === "string"
                              ? result.data.error
                              : (result.data?.error ? JSON.stringify(result.data.error) : "Failed to update role");
                          }
                        };
                      }}
                      method="POST"
                      action="?/changeRole"
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="adminLevel"
                        value={user.adminLevel.toString()}
                        class="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        on:change={(e) => {
                          const target = e.target as HTMLSelectElement | null;
                          if (target && target.form) {
                            target.form.requestSubmit();
                          }
                        }}
                      >
                        <option value="1" selected={user.adminLevel === 1}>Admin</option>
                        <option value="2" selected={user.adminLevel === 2}>User</option>
                      </select>
                    </form>
                  {:else}
                    {user.role}
                  {/if}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-[#4a1c1c]/70">Rank:</span>
                <span class="bg-[#4a1c1c]/10 text-[#4a1c1c]/90 px-2.5 py-1 rounded-full text-xs">
                  {user.rankName || "No Rank"}
                </span>
              </div>
            </div>
            <div class="pt-2">
              <p class="text-sm font-medium text-[#4a1c1c]/70 mb-2">Progress:</p>
              <div>
                {#each parseProgress(user.progress) as progressItem, i}
                  <div class="mb-2 last:mb-0" key="{user.id}-mobile-{i}">
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{progressItem.category}</span>
                      <span class="font-medium">{progressItem.percentage}%</span>
                    </div>
                    <div class="w-full bg-[#4a1c1c]/10 rounded-full h-2 overflow-hidden">
                      <div
                        class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style="width: {progressItem.percentage}%"
                      ></div>
                    </div>
                  </div>
                {/each}
                {#if parseProgress(user.progress).length === 0}
                  <span class="text-[#4a1c1c]/50 italic text-sm">No progress</span>
                {/if}
              </div>
            </div>
          </div>
          {#if currentUserAdminLevel === 0}
            <div>
              <form
                use:enhance={({ formElement }) => {
                  return async ({ result }) => {
                    if (result.type === "success" && result.data?.success) {
                      successMessage = typeof result.data.message === "string" ? result.data.message : "";
                    } else if (result.type === "failure") {
                      actionError = typeof result.data?.error === "string"
                        ? result.data.error
                        : (result.data?.error ? JSON.stringify(result.data.error) : "Failed to delete user");
                    }
                  };
                }}
                method="POST"
                action="?/deleteUser"
              >
                <input type="hidden" name="userId" value={user.id} />
                <button
                  type="submit"
                  class="flex items-center justify-center gap-1.5 bg-red-500/20 border border-red-400/30 text-[#4a1c1c] px-4 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors w-full mt-2"
                  on:click={(e) => {
                    if (!confirm('Are you sure you want to delete this user?')) {
                      e.preventDefault();
                    }
                  }}
                >
                  Delete
                </button>
              </form>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
  </section>
</main>
{/if}
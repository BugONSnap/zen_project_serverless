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

{#if loading}
  <div class="text-center py-12">
    <p class="text-lg font-semibold text-gray-700">Loading...</p>
  </div>
{:else if error}
  <div class="text-center py-12">
    <p class="text-red-500 font-semibold">{error}</p>
  </div>
{:else}
  <div class="min-h-screen bg-gradient-to-b from-[#FF0606] via-[#6F1414] to-[#050202] text-white">
  <main class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <section class="rounded-3xl border border-white/15 bg-black/40 p-8 shadow-xl backdrop-blur">
      <div class="space-y-2 text-center mb-6">
        <p class="text-xs uppercase tracking-[0.35em] text-white/60">Administration</p>
        <h1 class="text-3xl font-semibold text-white">User Management</h1>
        <p class="text-white/70">View all users, their roles, ranks, and progress across categories.</p>
      </div>
      {#if successMessage}
        <div class="bg-green-500/20 border border-green-400/40 text-green-100 px-6 py-3 rounded-xl mb-6 backdrop-blur" role="alert">
          <span class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            {successMessage}
          </span>
        </div>
      {/if}
      {#if actionError}
        <div class="bg-red-500/20 border border-red-400/40 text-red-100 px-6 py-3 rounded-xl mb-6 backdrop-blur" role="alert">
          <span class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {actionError}
          </span>
        </div>
      {/if}
      {#if users.length === 0}
        <p class="text-gray-500">No users found.</p>
      {:else}
        <!-- Desktop Table -->
        <div class="overflow-x-auto hidden md:block">
          <table class="min-w-full rounded-2xl overflow-hidden">
            <thead>
            <tr class="bg-white/10 backdrop-blur-sm">
              <th class="py-4 px-6 text-left text-sm font-medium text-white/80">Username</th>
              <th class="py-4 px-6 text-left text-sm font-medium text-white/80">Email</th>
              <th class="py-4 px-6 text-left text-sm font-medium text-white/80">Role</th>
              <th class="py-4 px-6 text-left text-sm font-medium text-white/80">Rank</th>
              <th class="py-4 px-6 text-left text-sm font-medium text-white/80">Progress</th>
              {#if currentUserAdminLevel === 0}
                <th class="py-4 px-6 text-left text-sm font-medium text-white/80">Actions</th>
              {/if}
            </tr>
          </thead>
          <tbody>
            {#each users as user, index}
              <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td class="py-4 px-6 text-white/90">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <span class="text-sm">{user.username[0].toUpperCase()}</span>
                    </div>
                    <span>{user.username}</span>
                  </div>
                </td>
                <td class="py-4 px-6 text-white/80">{user.email}</td>
                <td class="py-4 px-6">
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
                <td class="py-4 px-6">
                  <span class="inline-block bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm">
                    {user.rankName || "No Rank"}
                  </span>
                </td>
                <td class="py-4 px-6">
                  {#each parseProgress(user.progress) as progressItem, i}
                    <div class="mb-3 last:mb-2" key="{user.id}-{i}">
                      <div class="flex justify-between text-sm text-white/80 mb-1">
                        <span>{progressItem.category}</span>
                        <span class="font-medium">{progressItem.percentage}%</span>
                      </div>
                      <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
                          style="width: {progressItem.percentage}%"
                        ></div>
                      </div>
                    </div>
                  {/each}
                  {#if parseProgress(user.progress).length === 0}
                    <span class="text-white/50 italic text-sm">No progress</span>
                  {/if}
                </td>
                {#if currentUserAdminLevel === 0}
                  <td class="py-4 px-6">
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
                        class="flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 text-red-100 px-4 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors"
                        on:click={(e) => {
                          if (!confirm('Are you sure you want to delete this user?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <!-- Mobile/Tablet Cards -->
      <div class="md:hidden space-y-4">
        {#each users as user}
          <div class="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div class="flex flex-col gap-2 mb-3">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span class="text-lg">{user.username[0].toUpperCase()}</span>
                </div>
                <div>
                  <div class="font-medium text-white">{user.username}</div>
                  <div class="text-sm text-white/70">{user.email}</div>
                </div>
              </div>
              <div class="space-y-3 pt-3 border-t border-white/10">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-white/70">Role:</span>
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
                  <span class="text-sm font-medium text-white/70">Rank:</span>
                  <span class="bg-white/10 text-white/90 px-2.5 py-1 rounded-full text-xs">
                    {user.rankName || "No Rank"}
                  </span>
                </div>
              </div>
              <div class="pt-2">
                <p class="text-sm font-medium text-white/70 mb-2">Progress:</p>
                <div>
                  {#each parseProgress(user.progress) as progressItem, i}
                    <div class="mb-2 last:mb-0" key="{user.id}-mobile-{i}">
                      <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{progressItem.category}</span>
                        <span class="font-medium">{progressItem.percentage}%</span>
                      </div>
                      <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          class="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
                          style="width: {progressItem.percentage}%"
                        ></div>
                      </div>
                    </div>
                  {/each}
                  {#if parseProgress(user.progress).length === 0}
                    <span class="text-white/50 italic text-sm">No progress</span>
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
                    class="flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 text-red-100 px-4 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors w-full mt-2"
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
</div>
{/if}
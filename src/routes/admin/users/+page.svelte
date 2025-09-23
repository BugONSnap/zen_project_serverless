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
  <div class="flex justify-center items-start min-h-[80vh] mt-10">
    <div class="w-full max-w-5xl bg-white p-2 rounded-[12px] shadow-xl">
      <div class="space-y-2 text-center mb-4">
        <h1 class="text-4xl font-bold text-gray-800">User Management</h1>
        <p class="text-gray-600 text-lg">View all users, their roles, ranks, and progress across categories.</p>
      </div>
      {#if successMessage}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span class="block sm:inline">{successMessage}</span>
        </div>
      {/if}
      {#if actionError}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span class="block sm:inline">{actionError}</span>
        </div>
      {/if}
      {#if users.length === 0}
        <p class="text-gray-500">No users found.</p>
      {:else}
        <!-- Desktop Table -->
        <div class="overflow-x-auto hidden md:block border-radius-[12px]">
          <table class="min-w-full rounded-[15px] overflow-hidden shadow-lg">
            <thead class="bg-indigo-600 text-Black border" style="background-color: #50c5c1ab;">
            <tr>
              <th class="py-4 px-6 text-left text-sm font-semibold">Username</th>
              <th class="py-4 px-6 text-left text-sm font-semibold">Email</th>
              <th class="py-4 px-6 text-left text-sm font-semibold">Role</th>
              <th class="py-4 px-6 text-left text-sm font-semibold">Rank</th>
              <th class="py-4 px-6 text-left text-sm font-semibold">Progress</th>
              {#if currentUserAdminLevel === 0}
                <th class="py-4 px-6 text-left text-sm font-semibold">Actions</th>
              {/if}
            </tr>
          </thead>
          <tbody>
            {#each users as user, index}
              <tr class="border-b {index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors">
                <td class="py-4 px-6 text-gray-800">{user.username}</td>
                <td class="py-4 px-6 text-gray-800">{user.email}</td>
                <td class="py-4 px-6 text-gray-800">
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
                <td class="py-4 px-6 text-gray-800">{user.rankName || "No Rank"}</td>
                <td class="py-4 px-6 text-gray-800">
                  {#each parseProgress(user.progress) as progressItem, i}
                    <div class="mb-2 last:mb-0" key="{user.id}-{i}">
                      <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{progressItem.category}</span>
                        <span>{progressItem.percentage}%</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          class="bg-green-500 h-2.5 rounded-full"
                          style="width: {progressItem.percentage}%"
                        ></div>
                      </div>
                    </div>
                  {/each}
                  {#if parseProgress(user.progress).length === 0}
                    <span class="text-gray-500 italic">No progress</span>
                  {/if}
                </td>
                {#if currentUserAdminLevel === 0}
                  <td class="py-4 px-6 text-gray-800">
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
                        class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 transition-colors"
                        on:click={(e) => {
                          if (!confirm('Are you sure you want to delete this user?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
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
      <div class="md:hidden space-y-6">
        {#each users as user}
          <div class="bg-white rounded-lg shadow-lg p-4">
            <div class="flex flex-col gap-2 mb-3">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-700">Username:</span>
                <span>{user.username}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-700">Email:</span>
                <span>{user.email}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-700">Role:</span>
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
                <span class="font-semibold text-gray-700">Rank:</span>
                <span>{user.rankName || "No Rank"}</span>
              </div>
            </div>
            <div class="mb-3">
              <span class="font-semibold text-gray-700">Progress:</span>
              <div>
                {#each parseProgress(user.progress) as progressItem, i}
                  <div class="mb-2 last:mb-0" key="{user.id}-mobile-{i}">
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                      <span>{progressItem.category}</span>
                      <span>{progressItem.percentage}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        class="bg-green-500 h-2.5 rounded-full"
                        style="width: {progressItem.percentage}%"
                      ></div>
                    </div>
                  </div>
                {/each}
                {#if parseProgress(user.progress).length === 0}
                  <span class="text-gray-500 italic">No progress</span>
                {/if}
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
                    class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 transition-colors w-full mt-2"
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
  </div>
</div>
{/if}
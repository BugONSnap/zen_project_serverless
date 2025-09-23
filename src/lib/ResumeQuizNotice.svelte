<script lang="ts">
  import { onMount } from 'svelte';
  export let category: string;
  let hasInProgress = false;
  let loading = true;
  onMount(async () => {
    try {
      const res = await fetch('/api/quiz/resume');
      if (res.ok) {
        const data = await res.json();
        if (data && data.quizId && data.categoryId && data.status === 'IN_PROGRESS') {
          // Optionally filter by category if needed
          hasInProgress = true;
        }
      }
    } finally {
      loading = false;
    }
  });
</script>
{#if !loading && !hasInProgress}
  <div class="mt-4 flex flex-col items-center">
    <div class="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 shadow flex flex-col items-center w-full max-w-lg">
      <span class="font-semibold text-lg text-gray-700">No in-progress quiz to continue!</span>
    </div>
  </div>
{/if}

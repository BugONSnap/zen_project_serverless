<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  export let category: string;
  let hasInProgress = false;
  let loading = true;
  let inProgressQuiz: any = null;
  onMount(async () => {
    try {
      const res = await fetch('/api/quiz/resume');
      if (res.ok) {
        const data = await res.json();
        if (data && data.quizId && data.categoryId && data.status === 'IN_PROGRESS') {
          if (!category || data.categoryId == category || data.category === category) {
            hasInProgress = true;
            inProgressQuiz = data;
          }
        }
      }
    } finally {
      loading = false;
    }
  });
</script>
{#if !loading && hasInProgress && inProgressQuiz}
  <div class="mt-4 flex flex-col items-center">
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-4 shadow flex flex-col items-center w-full max-w-lg">
      <span class="font-semibold text-lg text-yellow-700 mb-2">You have an in-progress quiz!</span>
      <button class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors" on:click={() => goto(`/quiz?category=${inProgressQuiz.categoryId}&id=${inProgressQuiz.quizId}`)}>
        Resume Quiz
      </button>
    </div>
  </div>
{:else if !loading && !hasInProgress}
  <div class="mt-4 flex flex-col items-center">
   
  </div>
{/if}

<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  export let data;
  
  // State
  let errorMessage = '';
  let successMessage = '';
  let searchTitle = '';
  let searchCategory = '';
  let searchChallengeType = '';
  let searchDifficulty = '';
  let isCreating = false;
  let editingQuiz = null;
  let showDeleteConfirm = '';
  
  // Extract unique values for filters
  $: categories = [...new Set(data.quizzes.map(q => q.categoryName).filter(Boolean))];
  $: challengeTypes = [...new Set(data.quizzes.map(q => q.challengeTypeName).filter(Boolean))];
  $: difficulties = ['Easy', 'Medium', 'Hard'];

  // Handle form submission feedback
  $: if ($page.form?.error) {
    errorMessage = $page.form.error;
    successMessage = '';
    isCreating = false;
    editingQuiz = null;
  }
  
  $: if ($page.form?.success) {
    successMessage = $page.form.message;
    errorMessage = '';
    isCreating = false;
    editingQuiz = null;
  }

  // Reset messages after a delay
  $: if (successMessage || errorMessage) {
    setTimeout(() => {
      successMessage = '';
      errorMessage = '';
    }, 5000);
  }

  // Filter quizzes
  $: filteredQuizzes = data.quizzes.filter((quiz) => {
    const titleMatch = quiz.title.toLowerCase().includes(searchTitle.toLowerCase());
    const categoryMatch = !searchCategory || quiz.categoryName?.toLowerCase() === searchCategory.toLowerCase();
    const challengeTypeMatch = !searchChallengeType || quiz.challengeTypeName?.toLowerCase() === searchChallengeType.toLowerCase();
    const difficultyMatch = !searchDifficulty || quiz.difficulty?.toLowerCase() === searchDifficulty.toLowerCase();
    return titleMatch && categoryMatch && challengeTypeMatch && difficultyMatch;
  });

  // Toggle edit mode
  function openEditModal(quiz) {
    editingQuiz = { ...quiz };
  }
  
  function closeEditModal() {
    editingQuiz = null;
  }

  // Confirm delete
  function confirmDelete(quizId: string) {
    showDeleteConfirm = quizId;
  }

  // Cancel delete
  function cancelDelete() {
    showDeleteConfirm = '';
  }

  // Format options for display
  function formatOptions(options: string) {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed.join(', ') : options;
    } catch {
      return options;
    }
  }
</script>

<div class="space-y-6">
    <section class="rounded-3xl border-2 border-amber-400/30 bg-gray-900/60 backdrop-blur-xl shadow-2xl p-6 md:p-8 space-y-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-amber-400/15 pb-6">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.35em] text-amber-400/70">Quiz Management</p>
          <h1 class="text-3xl font-semibold text-amber-400">Quiz Administration</h1>
          <p class="text-sm text-gray-400 max-w-xl">Create, edit, and manage quiz questions and categories.</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl transition-colors font-semibold text-sm shrink-0"
          on:click={() => isCreating = !isCreating}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          {isCreating ? 'Cancel' : 'New Quiz'}
        </button>
      </div>

      <!-- Create Quiz Form -->
      {#if isCreating}
      <form 
        method="POST" 
        action="?/create" 
        use:enhance 
        class="mb-8 bg-gray-800/40 border-2 border-amber-400/30 p-6 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300"
      >
        <h2 class="text-xl font-semibold mb-4 text-amber-400">Create New Quiz</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="title" class="block text-sm font-medium text-amber-300/80 mb-1">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              class="mt-1 p-2 w-full bg-gray-800/50 border border-amber-400/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label for="points" class="block text-sm font-medium text-amber-300/80 mb-1">Points</label>
            <input
              type="number"
              name="points"
              id="points"
              class="mt-1 p-2 w-full bg-gray-800/50 border border-amber-400/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label for="answer" class="block text-sm font-medium text-amber-300/80 mb-1">Answer</label>
            <input
              type="text"
              name="answer"
              id="answer"
              class="mt-1 p-2 w-full bg-gray-800/50 border border-amber-400/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label for="difficulty" class="block text-sm font-medium text-amber-300/80 mb-1">Difficulty</label>
            <select
              name="difficulty"
              id="difficulty"
              class="mt-1 p-2 w-full bg-gray-800/50 border border-amber-400/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM" selected>Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div>
            <label for="quizCategoryId" class="block text-sm font-medium text-amber-300/80 mb-1">Category</label>
            <select
              name="quizCategoryId"
              id="quizCategoryId"
              class="mt-1 p-2 w-full bg-gray-800/50 border border-amber-400/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            >
              {#each data.categories as category}
                <option value={category.id}>{category.name}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="challengeTypeId" class="block text-sm font-medium text-amber-300/80 mb-1">Challenge Type</label>
            <select
              name="challengeTypeId"
              id="challengeTypeId"
              class="mt-1 p-2 w-full bg-gray-800/50 border border-amber-400/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              required
            >
              {#each [...new Map(data.challengeTypes.map(type => [type.name, type])).values()] as type}
                <option value={type.id}>{type.name}</option>
              {/each}
            </select>
          </div>
          <div class="md:col-span-2">
            <label for="description" class="block text-sm font-medium text-amber-300/80 mb-1">Description</label>
            <textarea
              name="description"
              id="description"
              class="mt-1 p-2 w-full bg-gray-800/50 border border-amber-400/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              rows="4"
            ></textarea>
          </div>
          <div class="md:col-span-2">
            <label for="explanation" class="block text-sm font-medium text-amber-300/80 mb-1">Explanation</label>
            <textarea
              name="explanation"
              id="explanation"
              class="mt-1 p-2 w-full bg-gray-800/50 border border-amber-400/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              rows="4"
            ></textarea>
          </div>
          <div>
            <label for="timeLimit" class="block text-sm font-medium text-amber-300/80 mb-1">Time Limit (seconds)</label>
            <input
              type="number"
              name="timeLimit"
              id="timeLimit"
              class="mt-1 p-2 w-full bg-gray-800/50 border border-amber-400/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label for="options" class="block text-sm font-medium text-amber-300/80 mb-1">Options (JSON)</label>
            <input
              type="text"
              name="options"
              id="options"
              class="mt-1 p-2 w-full bg-gray-800/50 border border-amber-400/30 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder='e.g., ["Option 1", "Option 2", "Option 3"]'
            />
          </div>
        </div>
        <button
          type="submit"
          class="mt-4 bg-amber-600/90 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
        >
          Create Quiz
        </button>
      </form>
      {/if}

      {#if errorMessage}
        <div class="mb-4 p-4 bg-red-900/20 border border-red-700/50 text-red-300 rounded">{errorMessage}</div>
      {/if}

      <!-- Filter Section -->
      <div class="bg-gray-800/30 border border-amber-400/15 rounded-2xl p-5 md:p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-amber-400/90">Search & Filter</h3>
          <p class="text-xs text-gray-500">
            Showing {filteredQuizzes.length} of {data.quizzes.length} quizzes
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="sm:col-span-2 xl:col-span-1">
            <label for="searchTitle" class="field-label">Search title</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                id="searchTitle"
                bind:value={searchTitle}
                placeholder="Search quizzes..."
                class="field-input pl-9"
              />
            </div>
          </div>
          <div>
            <label for="searchCategory" class="field-label">Category</label>
            <select id="searchCategory" bind:value={searchCategory} class="field-input admin-select">
              <option value="">All Categories</option>
              {#each categories as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="searchChallengeType" class="field-label">Type</label>
            <select id="searchChallengeType" bind:value={searchChallengeType} class="field-input admin-select">
              <option value="">All Types</option>
              {#each challengeTypes as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="searchDifficulty" class="field-label">Difficulty</label>
            <select id="searchDifficulty" bind:value={searchDifficulty} class="field-input admin-select">
              <option value="">All Difficulties</option>
              {#each difficulties as difficulty}
                <option value={difficulty}>{difficulty}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- Quiz List -->
      <div class="space-y-5">
        <h2 class="text-lg font-semibold text-white">Existing Quizzes</h2>
      {#if filteredQuizzes.length === 0}
        <div class="text-center py-12 bg-gray-800/30 rounded-2xl border-2 border-dashed border-amber-400/20">
          <svg class="mx-auto h-12 w-12 text-amber-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0111 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
          </svg>
          <h3 class="mt-2 text-lg font-medium text-amber-400">No quizzes found</h3>
          <p class="mt-1 text-gray-300">Try adjusting your search or create a new quiz.</p>
          {#if searchTitle || searchCategory || searchChallengeType || searchDifficulty}
            <button 
              on:click={() => {
                searchTitle = '';
                searchCategory = '';
                searchChallengeType = '';
                searchDifficulty = '';
              }}
              class="mt-4 inline-flex items-center px-4 py-2 border border-amber-400/30 text-sm font-medium rounded-md text-amber-300 bg-amber-600/20 hover:bg-amber-600/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Clear filters
            </button>
          {/if}
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
          {#each filteredQuizzes as quiz}
            <article class="quiz-card group flex flex-col bg-gray-800/35 border border-amber-400/20 rounded-2xl p-5 md:p-6 hover:border-amber-400/40 transition-all duration-200 hover:shadow-lg hover:shadow-amber-900/10">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <span class="quiz-badge quiz-badge-points">{quiz.points} pts</span>
                {#if quiz.difficulty}
                  <span class="quiz-badge {
                    quiz.difficulty === 'Easy' ? 'quiz-badge-easy' :
                    quiz.difficulty === 'Medium' ? 'quiz-badge-medium' :
                    'quiz-badge-hard'
                  }">
                    {quiz.difficulty}
                  </span>
                {/if}
              </div>

              <h3 class="text-base font-semibold text-white leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors mb-3">
                {quiz.title}
              </h3>

              <div class="flex flex-wrap gap-2 mb-4">
                {#if quiz.categoryName}
                  <span class="quiz-tag">{quiz.categoryName}</span>
                {/if}
                {#if quiz.challengeTypeName}
                  <span class="quiz-tag quiz-tag-muted">{quiz.challengeTypeName}</span>
                {/if}
              </div>

              <p class="text-sm text-gray-400 leading-relaxed line-clamp-3 flex-1 mb-5">
                {quiz.description || 'No description provided.'}
              </p>

              <div class="space-y-2.5 text-sm border-t border-amber-400/10 pt-4 mb-5">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-gray-500 shrink-0">Time limit</span>
                  <span class="font-medium text-amber-300 text-right">{quiz.timeLimit || 'N/A'} min</span>
                </div>
                <div class="flex items-start justify-between gap-3">
                  <span class="text-gray-500 shrink-0 pt-0.5">Answer</span>
                  <code class="answer-chip">{quiz.answer || 'N/A'}</code>
                </div>
                {#if quiz.explanation}
                  <div class="pt-2">
                    <p class="text-gray-500 text-xs mb-1">Explanation</p>
                    <p class="text-gray-400 text-xs leading-relaxed line-clamp-2">{quiz.explanation}</p>
                  </div>
                {/if}
              </div>

              <div class="mt-auto flex gap-2 pt-1">
                <button
                  type="button"
                  on:click={() => openEditModal(quiz)}
                  class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600/90 hover:bg-blue-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>
                <button
                  type="button"
                  on:click={() => confirmDelete(quiz.id)}
                  class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-white bg-red-600/90 hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0111 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  Delete
                </button>
              </div>
            </article>
          {/each}
        </div>
      {/if}
      </div>
    </section>

  <!-- Edit Quiz Modal -->
  {#if editingQuiz}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900/95 border-2 border-amber-400/50 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-amber-400">Edit Quiz</h3>
          <button 
            on:click={closeEditModal}
            class="text-gray-400 hover:text-white"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form 
          method="POST"
          action="?/update"
          use:enhance
          on:submit|preventDefault={async ({ form, data, action, cancel }) => {
            try {
              const response = await fetch(action, {
                method: 'POST',
                body: new FormData(form)
              });
              
              if (response.ok) {
                closeEditModal();
                // Reload the page to show updated data
                window.location.reload();
              } else {
                const error = await response.json();
                errorMessage = error.error || 'Failed to update quiz';
              }
            } catch (error) {
              errorMessage = 'An error occurred while updating the quiz';
              console.error('Update error:', error);
            }
          }}
        >
          <input type="hidden" name="id" value={editingQuiz.id} />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="edit-title" class="block text-sm font-medium text-amber-300/80 mb-1">Title</label>
              <input
                type="text"
                name="title"
                id="edit-title"
                bind:value={editingQuiz.title}
                class="w-full bg-gray-800/50 border border-amber-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label for="edit-points" class="block text-sm font-medium text-amber-300/80 mb-1">Points</label>
              <input
                type="number"
                name="points"
                id="edit-points"
                bind:value={editingQuiz.points}
                class="w-full bg-gray-800/50 border border-amber-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label for="edit-answer" class="block text-sm font-medium text-amber-300/80 mb-1">Answer</label>
              <input
                type="text"
                name="answer"
                id="edit-answer"
                bind:value={editingQuiz.answer}
                class="w-full bg-gray-800/50 border border-amber-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label for="edit-difficulty" class="block text-sm font-medium text-amber-300/80 mb-1">Difficulty</label>
              <select
                name="difficulty"
                id="edit-difficulty"
                bind:value={editingQuiz.difficulty}
                class="w-full bg-gray-800/50 border border-amber-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label for="edit-category" class="block text-sm font-medium text-amber-300/80 mb-1">Category</label>
              <select
                name="quizCategoryId"
                id="edit-category"
                class="w-full bg-gray-800/50 border border-amber-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              >
                {#each data.categories as category}
                  <option 
                    value={category.id} 
                    selected={editingQuiz.quizCategoryId === category.id}
                  >
                    {category.name}
                  </option>
                {/each}
              </select>
            </div>
            <div>
              <label for="edit-challenge-type" class="block text-sm font-medium text-amber-300/80 mb-1">Challenge Type</label>
              <select
                name="challengeTypeId"
                id="edit-challenge-type"
                class="w-full bg-gray-800/50 border border-amber-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              >
                {#each data.challengeTypes as type}
                  <option 
                    value={type.id}
                    selected={editingQuiz.challengeTypeId === type.id}
                  >
                    {type.name}
                  </option>
                {/each}
              </select>
            </div>
            <div class="md:col-span-2">
              <label for="edit-description" class="block text-sm font-medium text-amber-300/80 mb-1">Description</label>
              <textarea
                name="description"
                id="edit-description"
                value={editingQuiz.description || ''}
                on:input={(e) => editingQuiz.description = e.target.value}
                class="w-full bg-gray-800/50 border border-amber-400/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                rows="3"
              ></textarea>
            </div>
            <div class="md:col-span-2">
              <label for="edit-explanation" class="block text-sm font-medium text-amber-300/80 mb-1">Explanation</label>
              <textarea
                name="explanation"
                id="edit-explanation"
                value={editingQuiz.explanation || ''}
                on:input={(e) => editingQuiz.explanation = e.target.value}
                class="w-full bg-gray-800/50 border border-amber-400/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                rows="3"
              ></textarea>
            </div>
            <div class="md:col-span-2">
              <label for="edit-options" class="block text-sm font-medium text-amber-300/80 mb-1">Options (JSON array)</label>
              <input
                type="text"
                name="options"
                id="edit-options"
                value={editingQuiz.options ? JSON.stringify(editingQuiz.options) : ''}
                on:input={(e) => {
                  try {
                    editingQuiz.options = e.target.value ? JSON.parse(e.target.value) : null;
                  } catch (e) {
                    // Keep the invalid JSON as is for user to correct
                  }
                }}
                class="w-full bg-gray-800/50 border border-amber-400/30 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder='["Option 1", "Option 2", "Option 3"]'
              />
            </div>
            <div>
              <label for="edit-time-limit" class="block text-sm font-medium text-amber-300/80 mb-1">Time Limit (seconds)</label>
              <input
                type="number"
                name="timeLimit"
                id="edit-time-limit"
                value={editingQuiz.timeLimit || ''}
                on:input={(e) => editingQuiz.timeLimit = e.target.value ? parseInt(e.target.value) : null}
                class="w-full bg-gray-800/50 border border-amber-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          
          <div class="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              on:click={closeEditModal}
              class="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Modal -->
  {#if showDeleteConfirm}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900/95 border-2 border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 class="text-xl font-bold text-red-400 mb-4">Confirm Delete</h3>
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-600/20 border border-red-500/30">
          <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="mt-3 text-lg font-medium text-white">Delete Quiz</h3>
        <div class="mt-2">
          <p class="text-sm text-gray-300">Are you sure you want to delete this quiz? This action cannot be undone.</p>
        </div>
        <div class="mt-5 sm:mt-6 flex gap-3 justify-center">
          <button
            type="button"
            on:click={cancelDelete}
            class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm"
          >
            Cancel
          </button>
          <form method="POST" action="?/delete" use:enhance class="inline-flex">
            <input type="hidden" name="quizId" value={showDeleteConfirm} />
            <button
              type="submit"
              class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  {/if}

  <!-- Toast Notifications -->
  {#if successMessage}
    <div class="fixed bottom-4 right-4 z-50">
      <div class="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
        </svg>
        <span>{successMessage}</span>
      </div>
    </div>
  {/if}

  {#if errorMessage}
    <div class="fixed bottom-4 right-4 z-50">
      <div class="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414-1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
        </svg>
        <span>{errorMessage}</span>
      </div>
    </div>
  {/if}

  <style>
    .field-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: rgba(251, 191, 36, 0.65);
      margin-bottom: 0.375rem;
    }

    .field-input {
      width: 100%;
      background: rgba(17, 24, 39, 0.7);
      border: 1px solid rgba(75, 85, 99, 0.6);
      border-radius: 0.625rem;
      padding: 0.625rem 0.875rem;
      font-size: 0.875rem;
      color: #f3f4f6;
    }

    .field-input:focus {
      outline: none;
      border-color: #d97706;
      box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.25);
    }

    .field-input::placeholder {
      color: #6b7280;
    }

    .quiz-card {
      min-height: 100%;
    }

    .quiz-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.55rem;
      border-radius: 0.375rem;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .quiz-badge-points {
      background: rgba(217, 119, 6, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(217, 119, 6, 0.3);
    }

    .quiz-badge-easy {
      background: rgba(22, 163, 74, 0.15);
      color: #86efac;
      border: 1px solid rgba(22, 163, 74, 0.3);
    }

    .quiz-badge-medium {
      background: rgba(217, 119, 6, 0.15);
      color: #fcd34d;
      border: 1px solid rgba(217, 119, 6, 0.3);
    }

    .quiz-badge-hard {
      background: rgba(220, 38, 38, 0.15);
      color: #fca5a5;
      border: 1px solid rgba(220, 38, 38, 0.3);
    }

    .quiz-tag {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(217, 119, 6, 0.12);
      color: #fcd34d;
      border: 1px solid rgba(217, 119, 6, 0.25);
    }

    .quiz-tag-muted {
      background: rgba(55, 65, 81, 0.5);
      color: #d1d5db;
      border-color: rgba(75, 85, 99, 0.6);
      border-radius: 0.375rem;
    }

    .answer-chip {
      font-family: ui-monospace, monospace;
      font-size: 0.75rem;
      background: rgba(31, 41, 55, 0.8);
      color: #fcd34d;
      padding: 0.2rem 0.5rem;
      border-radius: 0.375rem;
      border: 1px solid rgba(75, 85, 99, 0.5);
      word-break: break-all;
      text-align: right;
      max-width: 65%;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  </style>
</div>
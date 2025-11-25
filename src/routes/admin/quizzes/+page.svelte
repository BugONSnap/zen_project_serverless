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

<div class="min-h-screen bg-gradient-to-b from-[#FF0606] via-[#6F1414] to-[#050202] text-white">
  <main class="max-w-7xl mx-auto px-4 py-8 space-y-6">
    <section class="rounded-3xl border border-white/15 bg-black/40 p-8 shadow-xl backdrop-blur">
      <div class="space-y-2 text-center mb-8">
        <p class="text-xs uppercase tracking-[0.35em] text-white/60">Quiz Management</p>
        <h1 class="text-3xl font-semibold text-white">Quiz Administration</h1>
        <p class="text-white/70">Create, edit, and manage quiz questions and categories</p>
      </div>

      <!-- Create/Edit Toggle -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-white">Quizzes</h2>
        <button
          type="button"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
        class="mb-8 bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300"
      >
        <h2 class="text-xl font-semibold mb-4 text-white">Create New Quiz</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="title" class="block text-sm font-medium text-white/80 mb-1">Title</label>
            <input
              type="text"
              name="title"
              id="title"
              class="mt-1 p-2 w-full border rounded"
              required
            />
          </div>
          <div>
            <label for="points" class="block text-sm font-medium text-white/80 mb-1">Points</label>
            <input
              type="number"
              name="points"
              id="points"
              class="mt-1 p-2 w-full border rounded"
              required
            />
          </div>
          <div>
            <label for="answer" class="block text-sm font-medium text-white/80 mb-1">Answer</label>
            <input
              type="text"
              name="answer"
              id="answer"
              class="mt-1 p-2 w-full border rounded"
              required
            />
          </div>
          <div>
            <label for="difficulty" class="block text-sm font-medium text-white/80 mb-1">Difficulty</label>
            <select
              name="difficulty"
              id="difficulty"
              class="mt-1 p-2 w-full border rounded"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM" selected>Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div>
            <label for="quizCategoryId" class="block text-sm font-medium text-white/80 mb-1">Category</label>
            <select
              name="quizCategoryId"
              id="quizCategoryId"
              class="mt-1 p-2 w-full border rounded"
              required
            >
              {#each data.categories as category}
                <option value={category.id}>{category.name}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="challengeTypeId" class="block text-sm font-medium text-white/80 mb-1">Challenge Type</label>
            <select
              name="challengeTypeId"
              id="challengeTypeId"
              class="mt-1 p-2 w-full border rounded"
              required
            >
              {#each [...new Map(data.challengeTypes.map(type => [type.name, type])).values()] as type}
                <option value={type.id}>{type.name}</option>
              {/each}
            </select>
          </div>
          <div class="md:col-span-2">
            <label for="description" class="block text-sm font-medium text-white/80 mb-1">Description</label>
            <textarea
              name="description"
              id="description"
              class="mt-1 p-2 w-full border rounded"
              rows="4"
            ></textarea>
          </div>
          <div class="md:col-span-2">
            <label for="explanation" class="block text-sm font-medium text-white/80 mb-1">Explanation</label>
            <textarea
              name="explanation"
              id="explanation"
              class="mt-1 p-2 w-full border rounded"
              rows="4"
            ></textarea>
          </div>
          <div>
            <label for="timeLimit" class="block text-sm font-medium text-white/80 mb-1">Time Limit (seconds)</label>
            <input
              type="number"
              name="timeLimit"
              id="timeLimit"
              class="mt-1 p-2 w-full border rounded"
            />
          </div>
          <div>
            <label for="options" class="block text-sm font-medium text-white/80 mb-1">Options (JSON)</label>
            <input
              type="text"
              name="options"
              id="options"
              class="mt-1 p-2 w-full border rounded"
              placeholder='e.g., ["Option 1", "Option 2", "Option 3"]'
            />
          </div>
        </div>
        <button
          type="submit"
          class="mt-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Create Quiz
        </button>
      </form>
      {/if}

      {#if errorMessage}
        <div class="mb-4 p-4 bg-red-100 text-red-700 rounded">{errorMessage}</div>
      {/if}

      <!-- Filter Section -->
      <div class="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm max-w-6xl mx-auto">
        <h3 class="text-lg font-medium text-white mb-6 text-center">Search & Filter</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Search Title -->
          <div>
            <label for="searchTitle" class="block text-sm font-medium text-white/80 mb-2">Search Title</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                id="searchTitle"
                bind:value={searchTitle}
                placeholder="Search quizzes..."
                class="pl-10 w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <!-- Category Filter -->
          <div>
            <label for="searchCategory" class="block text-sm font-medium text-white/80 mb-2">Filter by Category</label>
            <select
              id="searchCategory"
              bind:value={searchCategory}
              class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" class="bg-gray-800 text-white">All Categories</option>
              {#each categories as category}
                <option value={category} class="bg-gray-800 text-white">{category}</option>
              {/each}
            </select>
          </div>
          
          <!-- Challenge Type Filter -->
          <div>
            <label for="searchChallengeType" class="block text-sm font-medium text-white/80 mb-2">Filter by Type</label>
            <select
              id="searchChallengeType"
              bind:value={searchChallengeType}
              class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" class="bg-gray-800 text-white">All Types</option>
              {#each challengeTypes as type}
                <option value={type} class="bg-gray-800 text-white">{type}</option>
              {/each}
            </select>
          </div>
          
          <!-- Difficulty Filter -->
          <div>
            <label for="searchDifficulty" class="block text-sm font-medium text-white/80 mb-2">Filter by Difficulty</label>
            <select
              id="searchDifficulty"
              bind:value={searchDifficulty}
              class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="" class="bg-gray-800 text-white">All Difficulties</option>
              {#each difficulties as difficulty}
                <option value={difficulty} class="bg-gray-800 text-white">{difficulty}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- Quiz List -->
      <h2 class="text-xl font-semibold mb-4">Existing Quizzes</h2>
      {#if filteredQuizzes.length === 0}
        <div class="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
          <svg class="mx-auto h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0111 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
          </svg>
          <h3 class="mt-2 text-lg font-medium text-white">No quizzes found</h3>
          <p class="mt-1 text-white/60">Try adjusting your search or create a new quiz.</p>
          {#if searchTitle || searchCategory || searchChallengeType || searchDifficulty}
            <button 
              on:click={() => {
                searchTitle = '';
                searchCategory = '';
                searchChallengeType = '';
                searchDifficulty = '';
              }}
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear filters
            </button>
          {/if}
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each filteredQuizzes as quiz}
            <div class="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:shadow-lg">
              <!-- Quiz Header -->
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {quiz.title}
                  </h3>
                  <div class="flex items-center mt-1 space-x-2">
                    {#if quiz.categoryName}
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-100">
                        {quiz.categoryName}
                      </span>
                    {/if}
                    {#if quiz.challengeTypeName}
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/80">
                        {quiz.challengeTypeName}
                      </span>
                    {/if}
                  </div>
                </div>
                <div class="flex items-center space-x-1">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900/50 text-yellow-100">
                    {quiz.points} pts
                  </span>
                  {#if quiz.difficulty}
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      quiz.difficulty === 'Easy' ? 'bg-green-900/50 text-green-100' :
                      quiz.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-100' :
                      'bg-red-900/50 text-red-100'
                    }">
                      {quiz.difficulty}
                    </span>
                  {/if}
                </div>
              </div>

              <!-- Quiz Description -->
              <div class="prose prose-invert prose-sm text-white/70 mb-4">
                <p class="line-clamp-3">{quiz.description || 'No description provided.'}</p>
              </div>

              <!-- Quiz Metadata -->
              <div class="mt-4 pt-4 border-t border-white/10 text-sm">
                <div class="flex items-center justify-between py-1">
                  <span class="text-white/60">Time Limit:</span>
                  <span class="font-medium">{quiz.timeLimit || 'N/A'} min</span>
                </div>
                <div class="flex items-center justify-between py-1">
                  <span class="text-white/60">Answer:</span>
                  <span class="font-mono bg-white/10 px-2 py-0.5 rounded">{quiz.answer || 'N/A'}</span>
                </div>
                {#if quiz.explanation}
                  <div class="mt-2 pt-2 border-t border-white/5">
                    <p class="text-white/60">Explanation:</p>
                    <p class="text-white/80 text-sm">{quiz.explanation}</p>
                  </div>
                {/if}
                {#if quiz.options}
                  <div class="mt-2 pt-2 border-t border-white/5">
                    <p class="text-white/60">Options:</p>
                    <p class="text-white/80 text-sm">{formatOptions(quiz.options)}</p>
                  </div>
                {/if}
              </div>

              <!-- Actions -->
              <div class="mt-6 pt-4 border-t border-white/10 flex justify-end space-x-2">
                <button
                  type="button"
                  on:click={() => openEditModal(quiz)}
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>
                
                <button
                  type="button"
                  on:click={() => confirmDelete(quiz.id)}
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0111 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  </main>

  <!-- Edit Quiz Modal -->
  {#if editingQuiz}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-white">Edit Quiz</h3>
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
              <label for="edit-title" class="block text-sm font-medium text-white/80 mb-1">Title</label>
              <input
                type="text"
                name="title"
                id="edit-title"
                bind:value={editingQuiz.title}
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label for="edit-points" class="block text-sm font-medium text-white/80 mb-1">Points</label>
              <input
                type="number"
                name="points"
                id="edit-points"
                bind:value={editingQuiz.points}
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label for="edit-answer" class="block text-sm font-medium text-white/80 mb-1">Answer</label>
              <input
                type="text"
                name="answer"
                id="edit-answer"
                bind:value={editingQuiz.answer}
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label for="edit-difficulty" class="block text-sm font-medium text-white/80 mb-1">Difficulty</label>
              <select
                name="difficulty"
                id="edit-difficulty"
                bind:value={editingQuiz.difficulty}
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label for="edit-category" class="block text-sm font-medium text-white/80 mb-1">Category</label>
              <select
                name="quizCategoryId"
                id="edit-category"
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label for="edit-challenge-type" class="block text-sm font-medium text-white/80 mb-1">Challenge Type</label>
              <select
                name="challengeTypeId"
                id="edit-challenge-type"
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label for="edit-description" class="block text-sm font-medium text-white/80 mb-1">Description</label>
              <textarea
                name="description"
                id="edit-description"
                value={editingQuiz.description || ''}
                on:input={(e) => editingQuiz.description = e.target.value}
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              ></textarea>
            </div>
            <div class="md:col-span-2">
              <label for="edit-explanation" class="block text-sm font-medium text-white/80 mb-1">Explanation</label>
              <textarea
                name="explanation"
                id="edit-explanation"
                value={editingQuiz.explanation || ''}
                on:input={(e) => editingQuiz.explanation = e.target.value}
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              ></textarea>
            </div>
            <div class="md:col-span-2">
              <label for="edit-options" class="block text-sm font-medium text-white/80 mb-1">Options (JSON array)</label>
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
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder='["Option 1", "Option 2", "Option 3"]'
              />
            </div>
            <div>
              <label for="edit-time-limit" class="block text-sm font-medium text-white/80 mb-1">Time Limit (seconds)</label>
              <input
                type="number"
                name="timeLimit"
                id="edit-time-limit"
                value={editingQuiz.timeLimit || ''}
                on:input={(e) => editingQuiz.timeLimit = e.target.value ? parseInt(e.target.value) : null}
                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div class="bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    .prose {
      color: inherit;
    }
    .prose p {
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    /* Smooth transitions */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
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
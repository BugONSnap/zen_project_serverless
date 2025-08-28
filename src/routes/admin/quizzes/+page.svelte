<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';

  export let data;
  let errorMessage = '';
  let successMessage = '';
  let searchTitle = '';
  let searchCategory = '';
  let searchChallengeType = '';

  // Handle form submission feedback
  $: if ($page.form?.error) {
    errorMessage = $page.form.error;
    successMessage = '';
  }
  $: if ($page.form?.success) {
    successMessage = $page.form.message;
    errorMessage = '';
  }

  // Reset messages after a delay
  $: if (successMessage || errorMessage) {
    setTimeout(() => {
      successMessage = '';
      errorMessage = '';
    }, 3000);
  }

  // Filter quizzes
  $: filteredQuizzes = data.quizzes.filter((quiz) => {
    const titleMatch = quiz.title.toLowerCase().includes(searchTitle.toLowerCase());
    const categoryMatch = !searchCategory || quiz.categoryName?.toLowerCase() === searchCategory.toLowerCase();
    const challengeTypeMatch = !searchChallengeType || quiz.challengeTypeName?.toLowerCase() === searchChallengeType.toLowerCase();
    return titleMatch && categoryMatch && challengeTypeMatch;
  });
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-4 text-blue-800">Admin Quiz Management</h1>

  <!-- Create Quiz Form -->
  <form method="POST" action="?/create" use:enhance class="mb-8 bg-gray-100 p-6 rounded-lg shadow">
    <h2 class="text-xl font-semibold mb-4">Create New Quiz</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="title" class="block text-sm font-medium">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          class="mt-1 p-2 w-full border rounded"
          required
        />
      </div>
      <div>
        <label for="points" class="block text-sm font-medium">Points</label>
        <input
          type="number"
          name="points"
          id="points"
          class="mt-1 p-2 w-full border rounded"
          required
        />
      </div>
      <div>
        <label for="answer" class="block text-sm font-medium">Answer</label>
        <input
          type="text"
          name="answer"
          id="answer"
          class="mt-1 p-2 w-full border rounded"
          required
        />
      </div>
      <div>
        <label for="difficulty" class="block text-sm font-medium">Difficulty</label>
        <select name="difficulty" id="difficulty" class="mt-1 p-2 w-full border rounded">
          <option value="EASY">Easy</option>
          <option value="MEDIUM" selected>Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>
      <div>
        <label for="quizCategoryId" class="block text-sm font-medium">Category</label>
        <select name="quizCategoryId" id="quizCategoryId" class="mt-1 p-2 w-full border rounded" required>
          {#each data.categories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
      </div>
      <div>
        <label for="challengeTypeId" class="block text-sm font-medium">Challenge Type</label>
        <select name="challengeTypeId" id="challengeTypeId" class="mt-1 p-2 w-full border rounded" required>
          {#each data.challengeTypes as type}
            <option value={type.id}>{type.name}</option>
          {/each}
        </select>
      </div>
      <div class="md:col-span-2">
        <label for="description" class="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          id="description"
          class="mt-1 p-2 w-full border rounded"
          rows="4"
        ></textarea>
      </div>
      <div class="md:col-span-2">
        <label for="explanation" class="block text-sm font-medium">Explanation</label>
        <textarea
          name="explanation"
          id="explanation"
          class="mt-1 p-2 w-full border rounded"
          rows="4"
        ></textarea>
      </div>
      <div>
        <label for="timeLimit" class="block text-sm font-medium">Time Limit (seconds)</label>
        <input
          type="number"
          name="timeLimit"
          id="timeLimit"
          class="mt-1 p-2 w-full border rounded"
        />
      </div>
      <div>
        <label for="options" class="block text-sm font-medium">Options (JSON)</label>
        <input
          type="text"
          name="options"
          id="options"
          class="mt-1 p-2 w-full border rounded"
          placeholder='e.g., ["Option 1", "Option 2", "Option 3"]'
        />
      </div>
    </div>
    <button type="submit" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      Create Quiz
    </button>
  </form>

  <!-- Success/Error Messages -->
  {#if successMessage}
    <div class="mb-4 p-4 bg-green-100 text-green-700 rounded">{successMessage}</div>
  {/if}
  {#if errorMessage}
    <div class="mb-4 p-4 bg-red-100 text-red-700 rounded">{errorMessage}</div>
  {/if}

  <!-- Filter Section -->
  <div class="mb-4 flex flex-wrap gap-4">
    <div>
      <label for="searchTitle" class="block text-sm font-medium">Search by Title</label>
      <input
        type="text"
        id="searchTitle"
        bind:value={searchTitle}
        class="mt-1 p-2 w-full md:w-48 border rounded"
        placeholder="Enter title..."
      />
    </div>
    <div>
      <label for="searchCategory" class="block text-sm font-medium">Filter by Category</label>
      <select
        id="searchCategory"
        bind:value={searchCategory}
        class="mt-1 p-2 w-full md:w-48 border rounded"
      >
        <option value="">All Categories</option>
        {#each [...new Set(data.quizzes.map((q) => q.categoryName))] as category}
          <option value={category}>{category}</option>
        {/each}
      </select>
    </div>
    <div>
      <label for="searchChallengeType" class="block text-sm font-medium">Filter by Challenge Type</label>
      <select
        id="searchChallengeType"
        bind:value={searchChallengeType}
        class="mt-1 p-2 w-full md:w-48 border rounded"
      >
        <option value="">All Types</option>
        {#each [...new Set(data.quizzes.map((q) => q.challengeTypeName))] as type}
          <option value={type}>{type}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Quiz List -->
  <h2 class="text-xl font-semibold mb-4">Existing Quizzes</h2>
  {#if filteredQuizzes.length === 0}
    <p class="text-gray-500">No quizzes found.</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each filteredQuizzes as quiz}
        <div class="p-4 bg-white rounded-lg shadow">
          <h3 class="text-lg font-medium">{quiz.title}</h3>
          <p class="text-sm text-gray-600">
            Category: {quiz.categoryName} | Type: {quiz.challengeTypeName} | Points: {quiz.points} | Difficulty: {quiz.difficulty}
          </p>
          {#if quiz.description}
            <p class="text-sm text-gray-500 mt-2">{quiz.description}</p>
          {/if}
          {#if 'explanation' in quiz && quiz.explanation}
            <p class="text-sm text-gray-500 mt-2">{quiz.explanation}</p>
          {/if}
          <div class="mt-4 flex justify-end gap-2">
            <!-- Edit Button and Form -->
            <button
              on:click={() => {
                const form = document.getElementById(`editForm-${quiz.id}`);
                if (form) {
                  form.classList.toggle('hidden');
                }
              }}
              class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              Edit
            </button>
            <form
              id="editForm-{quiz.id}"
              method="POST"
              action="?/update"
              use:enhance
              class="hidden mt-2 w-full"
            >
              <input type="hidden" name="id" value={quiz.id} />
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label for="title-{quiz.id}" class="block text-sm font-medium">Title</label>
                  <input
                    type="text"
                    name="title"
                    id="title-{quiz.id}"
                    value={quiz.title}
                    class="mt-1 p-2 w-full border rounded"
                    required
                  />
                </div>
                <div>
                  <label for="points-{quiz.id}" class="block text-sm font-medium">Points</label>
                  <input
                    type="number"
                    name="points"
                    id="points-{quiz.id}"
                    value={quiz.points}
                    class="mt-1 p-2 w-full border rounded"
                    required
                  />
                </div>
                <div>
                  <label for="answer-{quiz.id}" class="block text-sm font-medium">Answer</label>
                  <input
                    type="text"
                    name="answer"
                    id="answer-{quiz.id}"
                    value={quiz.answer || ''}
                    class="mt-1 p-2 w-full border rounded"
                    required
                  />
                </div>
                <div>
                  <label for="difficulty-{quiz.id}" class="block text-sm font-medium">Difficulty</label>
                  <select
                    name="difficulty"
                    id="difficulty-{quiz.id}"
                    class="mt-1 p-2 w-full border rounded"
                  >
                    <option value="EASY" selected={quiz.difficulty === 'EASY'}>Easy</option>
                    <option value="MEDIUM" selected={quiz.difficulty === 'MEDIUM'}>Medium</option>
                    <option value="HARD" selected={quiz.difficulty === 'HARD'}>Hard</option>
                  </select>
                </div>
                <div>
                  <label for="quizCategoryId-{quiz.id}" class="block text-sm font-medium">Category</label>
                  <select
                    name="quizCategoryId"
                    id="quizCategoryId-{quiz.id}"
                    class="mt-1 p-2 w-full border rounded"
                    required
                  >
                    {#each data.categories as category}
                      <option value={category.id} selected={quiz.categoryName === category.name}>
                        {category.name}
                      </option>
                    {/each}
                  </select>
                </div>
                <div>
                  <label for="challengeTypeId-{quiz.id}" class="block text-sm font-medium">Challenge Type</label>
                  <select
                    name="challengeTypeId"
                    id="challengeTypeId-{quiz.id}"
                    class="mt-1 p-2 w-full border rounded"
                    required
                  >
                    {#each data.challengeTypes as type}
                      <option value={type.id} selected={quiz.challengeTypeName === type.name}>
                        {type.name}
                      </option>
                    {/each}
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label for="description-{quiz.id}" class="block text-sm font-medium">Description</label>
                  <textarea
                    name="description"
                    id="description-{quiz.id}"
                    class="mt-1 p-2 w-full border rounded"
                    rows="2"
                  >{quiz.description || ''}</textarea>
                </div>
                <div class="md:col-span-2">
                  <label for="explanation-{quiz.id}" class="block text-sm font-medium">Explanation</label>
                  <textarea
                    name="explanation"
                    id="explanation-{quiz.id}"
                    class="mt-1 p-2 w-full border rounded"
                    rows="2"
                  >{('explanation' in quiz && quiz.explanation) ? quiz.explanation : ''}</textarea>
                </div>
                <div>
                  <label for="timeLimit-{quiz.id}" class="block text-sm font-medium">Time Limit (seconds)</label>
                  <input
                    type="number"
                    name="timeLimit"
                    id="timeLimit-{quiz.id}"
                    value={quiz.timeLimit !== undefined ? quiz.timeLimit : ''}
                    class="mt-1 p-2 w-full border rounded"
                  />
                </div>
                <div>
                  <label for="options-{quiz.id}" class="block text-sm font-medium">Options (JSON)</label>
                  <input
                    type="text"
                    name="options"
                    id="options-{quiz.id}"
                    value={quiz.options ? JSON.stringify(quiz.options) : ''}
                    class="mt-1 p-2 w-full border rounded"
                    placeholder='e.g., ["Option 1", "Option 2", "Option 3"]'
                  />
                </div>
              </div>
              <div class="mt-2 flex gap-2">
                <button
                  type="submit"
                  class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  on:click={() => {
                    const form = document.getElementById(`editForm-${quiz.id}`);
                    if (form) form.classList.add('hidden');
                  }}
                  class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
            <!-- Delete Button -->
            <form method="POST" action="?/delete" use:enhance class="inline">
              <input type="hidden" name="quizId" value={quiz.id} />
              <button
                type="submit"
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                on:click={(e) => {
                  if (!confirm('Are you sure you want to delete this quiz?')) {
                    e.preventDefault();
                  }
                }}
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
 
</style>
<script lang="ts">
    import type { PageData } from './$types';
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    import { goto } from '$app/navigation';

    export let data: PageData;

    // Pagination state for each challenge type
    let identificationPage = 1;
    let codeChallengePage = 1;
    const perPage = 10; // Number of quizzes per page

    // Group quizzes by challenge type, filtering out those without a challengeType
    const identificationQuizzes = data.quizzes.filter(q => q.challengeType?.name === 'Identification');
    const codeChallengeQuizzes = data.quizzes.filter(q => q.challengeType?.name === 'Code Challenge');

    // Paginated slices
    $: identificationPaginated = identificationQuizzes.slice((identificationPage - 1) * perPage, identificationPage * perPage);
    $: codeChallengePaginated = codeChallengeQuizzes.slice((codeChallengePage - 1) * perPage, codeChallengePage * perPage);

    // Page counts
    $: identificationPages = Math.ceil(identificationQuizzes.length / perPage);
    $: codeChallengePages = Math.ceil(codeChallengeQuizzes.length / perPage);

    // Function to start a quiz - pass ID as search parameter
    function startQuiz(id: number) {
        goto(`/quiz?id=${id}`);
    }
</script>

<style>
    .book-cover {
        position: relative;
        width: 160px;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        cursor: pointer;
        transition: transform 0.2s;
    }
    .book-cover:hover {
        transform: scale(1.05);
    }
    .book-cover img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: brightness(0.95) contrast(1.1);
    }
    .book-title {
        position: relative;
        z-index: 2;
        color: #fff;
        text-shadow: 0 2px 8px #000, 0 0 2px #000;
        text-align: center;
        font-size: 2vh; /* Reverting to rem for better desktop display */
        font-weight: bold;
        padding: 0 8px;
        word-break: break-word; /* Ensure long titles wrap */
    }
    .flex-row-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        justify-content: flex-start;
    }
    .section-header {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        text-align: left;
    }
    .pagination-controls {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 16px;
    }
    .pagination-controls button {
        padding: 4px 12px;
        border-radius: 6px;
        background: #e5e7eb;
        color: #222;
        font-size: 0.95rem;
        border: none;
        cursor: pointer;
        transition: background 0.15s;
    }
    .pagination-controls button:disabled {
        background: #f3f4f6;
        color: #aaa;
        cursor: not-allowed;
    }
</style>

<div class="min-h-screen bg-cover bg-center" style="background-image: url('/BG.jpg');">
    <!-- Using data.category.name for the title -->
    <DashboardHeader title={data.category.name} user={undefined} />

    <main class="max-w-7xl mx-auto bg-white rounded-lg mt-10 py-2 px-2">
        <!-- Using data.category.name for the main heading -->
        <div class="bg-white shadow rounded-lg p-2 mb-2">
            <h2 class="text-3xl font-bold text-gray-900 mb-2 text-center">{data.category.name} Quizzes</h2>
        </div>

        <!-- Identification Quizzes Section -->
        <div class="mb-10">
            <div class="section-header text-blue-700">Identification Challenges</div>
            <div class="flex-row-wrap">
                {#each identificationPaginated as quiz}
                    <div class="book-cover" on:click={() => startQuiz(quiz.id)} title={quiz.title}>
                         <img src="/Module%20cover.png" alt="Book Cover" />
                        <span class="book-title">{quiz.title}</span>
                    </div>
                {/each}
            </div>
            <div class="pagination-controls">
                <button on:click={() => identificationPage = Math.max(1, identificationPage - 1)} disabled={identificationPage === 1}>Prev</button>
                <span>Page {identificationPage} of {identificationPages}</span>
                <button on:click={() => identificationPage = Math.min(identificationPages, identificationPage + 1)} disabled={identificationPage === identificationPages}>Next</button>
            </div>
        </div>

        <!-- Code Challenge Quizzes Section -->
        <div class="mb-10">
            <div class="section-header text-red-700">Code Challenges</div>
            <div class="flex-row-wrap">
                {#each codeChallengePaginated as quiz}
                    <div class="book-cover" on:click={() => startQuiz(quiz.id)} title={quiz.title}>
                        <img src="/Module%20cover.png" alt="Book Cover" />
                        <span class="book-title">{quiz.title}</span>
                    </div>
                {/each}
            </div>
            <div class="pagination-controls">
                <button on:click={() => codeChallengePage = Math.max(1, codeChallengePage - 1)} disabled={codeChallengePage === 1}>Prev</button>
                <span>Page {codeChallengePage} of {codeChallengePages}</span>
                <button on:click={() => codeChallengePage = Math.min(codeChallengePages, codeChallengePage + 1)} disabled={codeChallengePage === codeChallengePages}>Next</button>
            </div>
        </div>
    </main>
</div>
<script lang="ts">
    import type { PageData } from './$types';
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    import { goto } from '$app/navigation';

    export let data: PageData;

    // Pagination state for each difficulty
    let easyPage = 1;
    let mediumPage = 1;
    let hardPage = 1;
    const perPage = 10;

    // Group quizzes by difficulty
    const easyQuizzes = data.quizzes.filter(q => q.difficulty === 'EASY');
    const mediumQuizzes = data.quizzes.filter(q => q.difficulty === 'MEDIUM');
    const hardQuizzes = data.quizzes.filter(q => q.difficulty === 'HARD');

    // Paginated slices
    $: easyPaginated = easyQuizzes.slice((easyPage-1)*perPage, easyPage*perPage);
    $: mediumPaginated = mediumQuizzes.slice((mediumPage-1)*perPage, mediumPage*perPage);
    $: hardPaginated = hardQuizzes.slice((hardPage-1)*perPage, hardPage*perPage);

    // Page counts
    $: easyPages = Math.ceil(easyQuizzes.length/perPage);
    $: mediumPages = Math.ceil(mediumQuizzes.length/perPage);
    $: hardPages = Math.ceil(hardQuizzes.length/perPage);

    // Function to start a quiz with category, difficulty, and id
    function startQuiz(category: string, difficulty: string | null, id: number) {
        goto(`/quiz?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty || '')}&id=${id}`);
    }

    function scrollToSection(id: string) {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

  body {
    font-family: 'Poppins', sans-serif !important;
  }

  html {
    scroll-behavior: smooth;
  }
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
}
.flex-row-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    justify-content: flex-start;
}
.section-header {
    font-size: 1.75rem; /* Slightly larger for prominence */
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
@media (max-width: 768px) {
    .flex-row-wrap {
        justify-content: center;
        gap: 16px;
    }
    .book-cover {
        width: 140px;
        height: 180px;
    }
    .book-title {
      font-size: 0.95rem; /* Keep smaller font for mobile */
    }
}

@media (max-width: 480px) {
    .flex-row-wrap {
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }
    .book-cover {
        width: 80%;
        max-width: 200px;
        height: auto;
        aspect-ratio: 160 / 200;
    }
    .book-title {
        font-size: 0.95rem;
    }
}

.mobile-nav {
    display: none; /* Hidden by default */
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #333;
    color: white;
    padding: 10px 0;
    text-align: center;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
    z-index: 1000;
}

.mobile-nav a {
    color: white;
    text-decoration: none;
    padding: 0 15px;
    font-weight: bold;
}

.mobile-nav a:hover {
    color: #ffd700; /* Gold color on hover */
}

@media (max-width: 768px) {
    .mobile-nav {
        display: flex; /* Show on tablets and mobile */
        justify-content: space-around;
    }
}
h2 {
    font-family: 'Poppins', sans-serif !important;
}
</style>

<div class="min-h-screen bg-cover bg-center" style="background-image: url('/BG.jpg');">
    <DashboardHeader title="HTML Quizzes" user={undefined} />
    <main class="max-w-7xl mx-auto py-8 px-4">
        <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Available HTML Quizzes</h2>

            <div class="mb-10">
                <div id="easy-area" class="section-header text-green-700">Easy Area</div>
                <div class="flex-row-wrap">
                    {#each easyPaginated as quiz}
                        <div class="book-cover" on:click={() => startQuiz('HTML', quiz.difficulty, quiz.id)} title={quiz.title}>
                            <img src="/Module%20cover.png" alt="Book Cover" />
                            <span class="book-title">{quiz.title}</span>
                        </div>
                    {/each}
                </div>
                <div class="pagination-controls">
                    <button on:click={() => easyPage = Math.max(1, easyPage-1)} disabled={easyPage === 1}>Prev</button>
                    <span>Page {easyPage} of {easyPages}</span>
                    <button on:click={() => easyPage = Math.min(easyPages, easyPage+1)} disabled={easyPage === easyPages}>Next</button>
                </div>
            </div>

            <div class="mb-10">
                <div id="medium-area" class="section-header text-yellow-700">Medium Area</div>
                <div class="flex-row-wrap">
                    {#each mediumPaginated as quiz}
                        <div class="book-cover" on:click={() => startQuiz('HTML', quiz.difficulty, quiz.id)} title={quiz.title}>
                            <img src="/Module%20cover.png" alt="Book Cover" />
                            <span class="book-title">{quiz.title}</span>
                        </div>
                    {/each}
                </div>
                <div class="pagination-controls">
                    <button on:click={() => mediumPage = Math.max(1, mediumPage-1)} disabled={mediumPage === 1}>Prev</button>
                    <span>Page {mediumPage} of {mediumPages}</span>
                    <button on:click={() => mediumPage = Math.min(mediumPages, mediumPage+1)} disabled={mediumPage === mediumPages}>Next</button>
                </div>
            </div>

            <div>
                <div id="hard-area" class="section-header text-red-700">Hard Area</div>
                <div class="flex-row-wrap">
                    {#each hardPaginated as quiz}
                        <div class="book-cover" on:click={() => startQuiz('HTML', quiz.difficulty, quiz.id)} title={quiz.title}>
                            <img src="/Module%20cover.png" alt="Book Cover" />
                            <span class="book-title">{quiz.title}</span>
                        </div>
                    {/each}
                </div>
                <div class="pagination-controls">
                    <button on:click={() => hardPage = Math.max(1, hardPage-1)} disabled={hardPage === 1}>Prev</button>
                    <span>Page {hardPage} of {hardPages}</span>
                    <button on:click={() => hardPage = Math.min(hardPages, hardPage+1)} disabled={hardPage === hardPages}>Next</button>
                </div>
            </div>
        </div>
    </main>
</div>

<nav class="mobile-nav">
    <a href="#easy-area" on:click|preventDefault={() => scrollToSection('easy-area')}>Easy</a>
    <a href="#medium-area" on:click|preventDefault={() => scrollToSection('medium-area')}>Medium</a>
    <a href="#hard-area" on:click|preventDefault={() => scrollToSection('hard-area')}>Hard</a>
</nav>
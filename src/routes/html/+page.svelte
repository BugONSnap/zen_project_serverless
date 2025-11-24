<script lang="ts">
    import type { PageData } from './$types';
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    export let data: PageData;

    // Resume quiz state
    let loadingResume = true;
    let inProgressQuiz: any = null;
    onMount(async () => {
        try {
            const res = await fetch('/api/quiz/resume');
            if (res.ok) {
                const quiz = await res.json();
                if (quiz && quiz.quizId && quiz.status === 'IN_PROGRESS') {
                    if (quiz.category === 'HTML') {
                        inProgressQuiz = quiz;
                    }
                }
            }
        } finally {
            loadingResume = false;
        }
    });

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

    const isAnswered = (id: number) => (data.answeredQuizIds ?? []).includes(id);
</script>

<div class="min-h-screen bg-gradient-to-b from-[#FF0606] via-[#6F1414] to-[#050202] text-white">
    <DashboardHeader title="HTML Quizzes" user={data.user} />
    <main class="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <section class="rounded-3xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur">
            <div class="text-center space-y-2">
                <p class="text-xs uppercase tracking-[0.35em] text-white/60">HTML track</p>
                <h2 class="text-4xl font-semibold">Available quizzes</h2>
                <p class="text-white/70">Master semantic markup one chapter at a time.</p>
            </div>
        </section>

        {#if !loadingResume && inProgressQuiz}
            <section class="rounded-3xl border border-amber-300/40 bg-amber-500/10 p-6 shadow-xl backdrop-blur flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p class="text-xs uppercase tracking-[0.35em] text-amber-200">Resume</p>
                    <h3 class="text-2xl font-semibold text-white">You have an in-progress quiz</h3>
                    <p class="text-white/70">Pick up exactly where you left off.</p>
                </div>
                <button class="rounded-full border border-amber-200 px-6 py-2 text-sm text-amber-100 hover:bg-amber-300/10 transition" on:click={() => goto(`/quiz?category=${inProgressQuiz.categoryId}&id=${inProgressQuiz.quizId}`)}>
                    Resume Quiz
                </button>
            </section>
        {/if}

        <section class="rounded-3xl border border-white/15 bg-black/30 p-6 shadow-xl backdrop-blur space-y-6" id="easy-area">
            <div>
                <p class="text-xs uppercase tracking-[0.35em] text-white/60">Easy Area</p>
                <h3 class="mt-2 text-3xl font-semibold text-white">Warm-up drills</h3>
                <p class="text-white/70">Kick off with fundamentals and confidence boosters.</p>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                {#if easyPaginated.length === 0}
                    <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">No quizzes available.</div>
                {:else}
                    {#each easyPaginated as quiz}
                        <button
                            class={`relative rounded-2xl border border-white/10 bg-black/40 p-4 text-left shadow-lg backdrop-blur transition hover:border-emerald-400/60 ${isAnswered(quiz.id) ? 'opacity-40 pointer-events-none' : ''}`}
                            on:click={() => !isAnswered(quiz.id) && startQuiz('HTML', quiz.difficulty, quiz.id)}
                        >
                            <div class="flex items-center justify-between">
                                <span class="text-sm uppercase tracking-[0.35em] text-white/60">{quiz.difficulty}</span>
                                {#if isAnswered(quiz.id)}
                                    <span class="rounded-full border border-emerald-400/70 px-3 py-1 text-xs text-emerald-200">Done</span>
                                {/if}
                            </div>
                            <p class="mt-2 text-lg font-semibold text-white">{quiz.title}</p>
                            <p class="text-sm text-white/60">Tap to launch challenge</p>
                        </button>
                    {/each}
                {/if}
            </div>
            {#if easyPages > 1}
                <div class="flex items-center justify-center gap-4 text-sm text-white/70">
                    <button class="rounded-full border border-white/15 px-4 py-1 hover:border-white/40 disabled:opacity-30" on:click={() => easyPage = Math.max(1, easyPage - 1)} disabled={easyPage === 1}>
                        Prev
                    </button>
                    <span>Page {easyPage} of {easyPages}</span>
                    <button class="rounded-full border border-white/15 px-4 py-1 hover:border-white/40 disabled:opacity-30" on:click={() => easyPage = Math.min(easyPages, easyPage + 1)} disabled={easyPage === easyPages}>
                        Next
                    </button>
                </div>
            {/if}
        </section>

        <section class="rounded-3xl border border-white/15 bg-black/30 p-6 shadow-xl backdrop-blur space-y-6" id="medium-area">
            <div>
                <p class="text-xs uppercase tracking-[0.35em] text-white/60">Medium Area</p>
                <h3 class="mt-2 text-3xl font-semibold text-white">Scenario builds</h3>
                <p class="text-white/70">Tackle realistic layouts and applied semantics.</p>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                {#if mediumPaginated.length === 0}
                    <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">No quizzes available.</div>
                {:else}
                    {#each mediumPaginated as quiz}
                        <button
                            class={`relative rounded-2xl border border-white/10 bg-black/40 p-4 text-left shadow-lg backdrop-blur transition hover:border-emerald-400/60 ${isAnswered(quiz.id) ? 'opacity-40 pointer-events-none' : ''}`}
                            on:click={() => !isAnswered(quiz.id) && startQuiz('HTML', quiz.difficulty, quiz.id)}
                        >
                            <div class="flex items-center justify-between">
                                <span class="text-sm uppercase tracking-[0.35em] text-white/60">{quiz.difficulty}</span>
                                {#if isAnswered(quiz.id)}
                                    <span class="rounded-full border border-emerald-400/70 px-3 py-1 text-xs text-emerald-200">Done</span>
                                {/if}
                            </div>
                            <p class="mt-2 text-lg font-semibold text-white">{quiz.title}</p>
                            <p class="text-sm text-white/60">Tap to launch challenge</p>
                        </button>
                    {/each}
                {/if}
            </div>
            {#if mediumPages > 1}
                <div class="flex items-center justify-center gap-4 text-sm text-white/70">
                    <button class="rounded-full border border-white/15 px-4 py-1 hover:border-white/40 disabled:opacity-30" on:click={() => mediumPage = Math.max(1, mediumPage - 1)} disabled={mediumPage === 1}>
                        Prev
                    </button>
                    <span>Page {mediumPage} of {mediumPages}</span>
                    <button class="rounded-full border border-white/15 px-4 py-1 hover:border-white/40 disabled:opacity-30" on:click={() => mediumPage = Math.min(mediumPages, mediumPage + 1)} disabled={mediumPage === mediumPages}>
                        Next
                    </button>
                </div>
            {/if}
        </section>

        <section class="rounded-3xl border border-white/15 bg-black/30 p-6 shadow-xl backdrop-blur space-y-6" id="hard-area">
            <div>
                <p class="text-xs uppercase tracking-[0.35em] text-white/60">Hard Area</p>
                <h3 class="mt-2 text-3xl font-semibold text-white">Deep dives</h3>
                <p class="text-white/70">Push semantic precision and accessibility to the limit.</p>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                {#if hardPaginated.length === 0}
                    <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">No quizzes available.</div>
                {:else}
                    {#each hardPaginated as quiz}
                        <button
                            class={`relative rounded-2xl border border-white/10 bg-black/40 p-4 text-left shadow-lg backdrop-blur transition hover:border-emerald-400/60 ${isAnswered(quiz.id) ? 'opacity-40 pointer-events-none' : ''}`}
                            on:click={() => !isAnswered(quiz.id) && startQuiz('HTML', quiz.difficulty, quiz.id)}
                        >
                            <div class="flex items-center justify-between">
                                <span class="text-sm uppercase tracking-[0.35em] text-white/60">{quiz.difficulty}</span>
                                {#if isAnswered(quiz.id)}
                                    <span class="rounded-full border border-emerald-400/70 px-3 py-1 text-xs text-emerald-200">Done</span>
                                {/if}
                            </div>
                            <p class="mt-2 text-lg font-semibold text-white">{quiz.title}</p>
                            <p class="text-sm text-white/60">Tap to launch challenge</p>
                        </button>
                    {/each}
                {/if}
            </div>
            {#if hardPages > 1}
                <div class="flex items-center justify-center gap-4 text-sm text-white/70">
                    <button class="rounded-full border border-white/15 px-4 py-1 hover:border-white/40 disabled:opacity-30" on:click={() => hardPage = Math.max(1, hardPage - 1)} disabled={hardPage === 1}>
                        Prev
                    </button>
                    <span>Page {hardPage} of {hardPages}</span>
                    <button class="rounded-full border border-white/15 px-4 py-1 hover:border-white/40 disabled:opacity-30" on:click={() => hardPage = Math.min(hardPages, hardPage + 1)} disabled={hardPage === hardPages}>
                        Next
                    </button>
                </div>
            {/if}
        </section>
    </main>
</div>

<nav class="fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-white/20 bg-black/40 px-6 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur lg:hidden">
    <div class="flex items-center justify-between">
        <a href="#easy-area" class="hover:text-emerald-200" on:click|preventDefault={() => scrollToSection('easy-area')}>Easy</a>
        <a href="#medium-area" class="hover:text-emerald-200" on:click|preventDefault={() => scrollToSection('medium-area')}>Medium</a>
        <a href="#hard-area" class="hover:text-emerald-200" on:click|preventDefault={() => scrollToSection('hard-area')}>Hard</a>
    </div>
</nav>
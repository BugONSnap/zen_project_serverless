<script lang="ts">
    import type { PageData } from './$types';
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    import ResumeQuizNotice from '$lib/ResumeQuizNotice.svelte';
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

<div class="min-h-screen text-[#4a1c1c] font-medium relative dashboard-bg" style="background: linear-gradient(to bottom, #ffbdbd 0%, #ff9b9b 50%, #ff7b7b 100%); overflow: visible;">
    <DashboardHeader title="CSS Quizzes" user={data.user} />
    <main class="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <section class="rounded-3xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur">
            <div class="text-center space-y-2">
                <p class="text-xs uppercase tracking-[0.35em] text-white/60">CSS track</p>
                <h2 class="text-4xl font-semibold">Available quizzes</h2>
                <p class="text-white/70">Master layout systems, selectors, and animation flows.</p>
            </div>
        </section>

        <ResumeQuizNotice category="CSS" />

        <section class="rounded-3xl border border-white/15 bg-black/30 p-6 shadow-xl backdrop-blur space-y-6" id="easy-area">
            <div>
                <p class="text-xs uppercase tracking-[0.35em] text-white/60">Easy Area</p>
                <h3 class="mt-2 text-3xl font-semibold text-white">Foundational drills</h3>
                <p class="text-white/70">Selectors, spacing, and core cascade exercises.</p>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                {#if easyPaginated.length === 0}
                    <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">No quizzes available.</div>
                {:else}
                    {#each easyPaginated as quiz}
                        <button
                            class={`relative rounded-2xl border border-white/15 bg-black/40 p-4 text-left shadow-lg backdrop-blur transition hover:border-emerald-400/60 ${(data.answeredQuizIds ?? []).includes(quiz.id) ? 'opacity-40 pointer-events-none' : ''}`}
                            on:click={() => !(data.answeredQuizIds ?? []).includes(quiz.id) && startQuiz('CSS', quiz.difficulty, quiz.id)}
                        >
                            <div class="flex items-center justify-between">
                                <span class="text-sm uppercase tracking-[0.35em] text-white/60">{quiz.difficulty}</span>
                                {#if (data.answeredQuizIds ?? []).includes(quiz.id)}
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
                <h3 class="mt-2 text-3xl font-semibold text-white">Layout patterns</h3>
                <p class="text-white/70">Responsive grids, pseudo-classes, and flexbox thought exercises.</p>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                {#if mediumPaginated.length === 0}
                    <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">No quizzes available.</div>
                {:else}
                    {#each mediumPaginated as quiz}
                        <button
                            class={`relative rounded-2xl border border-white/15 bg-black/40 p-4 text-left shadow-lg backdrop-blur transition hover:border-emerald-400/60 ${(data.answeredQuizIds ?? []).includes(quiz.id) ? 'opacity-40 pointer-events-none' : ''}`}
                            on:click={() => !(data.answeredQuizIds ?? []).includes(quiz.id) && startQuiz('CSS', quiz.difficulty, quiz.id)}
                        >
                            <div class="flex items-center justify-between">
                                <span class="text-sm uppercase tracking-[0.35em] text-white/60">{quiz.difficulty}</span>
                                {#if (data.answeredQuizIds ?? []).includes(quiz.id)}
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
                <p class="text-white/70">Animations, complex state handling, and CSS architecture puzzles.</p>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                {#if hardPaginated.length === 0}
                    <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">No quizzes available.</div>
                {:else}
                    {#each hardPaginated as quiz}
                        <button
                            class={`relative rounded-2xl border border-white/15 bg-black/40 p-4 text-left shadow-lg backdrop-blur transition hover:border-emerald-400/60 ${(data.answeredQuizIds ?? []).includes(quiz.id) ? 'opacity-40 pointer-events-none' : ''}`}
                            on:click={() => !(data.answeredQuizIds ?? []).includes(quiz.id) && startQuiz('CSS', quiz.difficulty, quiz.id)}
                        >
                            <div class="flex items-center justify-between">
                                <span class="text-sm uppercase tracking-[0.35em] text-white/60">{quiz.difficulty}</span>
                                {#if (data.answeredQuizIds ?? []).includes(quiz.id)}
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

<section class="sr-only"></section>
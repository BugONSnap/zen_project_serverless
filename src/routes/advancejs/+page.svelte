<script lang="ts">
    import type { PageData } from './$types';
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    import ResumeQuizNotice from '$lib/ResumeQuizNotice.svelte';
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

<div class="min-h-screen text-[#4a1c1c] font-medium relative dashboard-bg" style="background: linear-gradient(to bottom, #ffbdbd 0%, #ff9b9b 50%, #ff7b7b 100%); overflow: visible;">
    <DashboardHeader title={data.category.name} user={data.user} />
    <main class="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <section class="rounded-3xl border border-white/15 bg-[#090303]/70 p-8 shadow-2xl backdrop-blur text-center space-y-2">
            <p class="text-xs uppercase tracking-[0.35em] text-white/60">Advanced JavaScript Track</p>
            <h2 class="text-4xl font-semibold">Available quizzes</h2>
            <p class="text-white/80">Push your skills with async, patterns, code writing and architecture. Challenges below.</p>
        </section>
        <ResumeQuizNotice category={data.category?.name || 'AdvanceJS'} />
        <section class="rounded-3xl border border-white/15 bg-[#090303]/70 p-6 shadow-xl backdrop-blur space-y-6" id="identification-area">
            <div>
                <p class="text-xs uppercase tracking-[0.35em] text-white/60">Identification Challenges</p>
                <h3 class="mt-2 text-3xl font-semibold text-white">Spot and Identify</h3>
                <p class="text-white/80">Quick recognition and conceptual comprehension challenges. Name it right!</p>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                {#if identificationPaginated.length === 0}
                    <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white/80">No quizzes available.</div>
                {:else}
                    {#each identificationPaginated as quiz}
                        <button
                            class={`relative rounded-2xl border border-white/15 bg-black/40 p-4 text-left shadow-lg backdrop-blur transition hover:border-emerald-400/60 ${(data.answeredQuizIds ?? []).includes(quiz.id) ? 'opacity-40 pointer-events-none' : ''}`}
                            on:click={() => !(data.answeredQuizIds ?? []).includes(quiz.id) && startQuiz(quiz.id)}
                        >
                            <div class="flex items-center justify-between">
                                <span class="text-sm uppercase tracking-[0.35em] text-white/60">Identification</span>
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
            {#if identificationPages > 1}
                <div class="flex items-center justify-center gap-4 rounded-2xl border border-white/15 bg-[#090303]/70 p-4 text-sm text-white/80 shadow-lg backdrop-blur">
                    <button
                        class="rounded-full border border-white/15 px-4 py-1 hover:border-white/40 disabled:opacity-30"
                        on:click={() => identificationPage = Math.max(1, identificationPage - 1)}
                        disabled={identificationPage === 1}
                    >
                        Prev
                    </button>
                    <span>Page {identificationPage} of {identificationPages}</span>
                    <button
                        class="rounded-full border border-white/15 px-4 py-1 hover:border-white/40 disabled:opacity-30"
                        on:click={() => identificationPage = Math.min(identificationPages, identificationPage + 1)}
                        disabled={identificationPage === identificationPages}
                    >
                        Next
                    </button>
                </div>
            {/if}
        </section>
        <section class="rounded-3xl border border-white/15 bg-[#090303]/70 p-6 shadow-xl backdrop-blur space-y-6" id="code-challenge-area">
            <div>
                <p class="text-xs uppercase tracking-[0.35em] text-white/60">Code Challenge Block</p>
                <h3 class="mt-2 text-3xl font-semibold text-white">Write and Debug</h3>
                <p class="text-white/80">Put your skills to the test—solve code, debug, and architect solutions.</p>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
                {#if codeChallengePaginated.length === 0}
                    <div class="rounded-2xl border border-white/15 bg-white/5 p-4 text-white/80">No quizzes available.</div>
                {:else}
                    {#each codeChallengePaginated as quiz}
                        <button
                            class={`relative rounded-2xl border border-white/15 bg-black/40 p-4 text-left shadow-lg backdrop-blur transition hover:border-emerald-400/60 ${(data.answeredQuizIds ?? []).includes(quiz.id) ? 'opacity-40 pointer-events-none' : ''}`}
                            on:click={() => !(data.answeredQuizIds ?? []).includes(quiz.id) && startQuiz(quiz.id)}
                        >
                            <div class="flex items-center justify-between">
                                <span class="text-sm uppercase tracking-[0.35em] text-white/60">Code Challenge</span>
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
            {#if codeChallengePages > 1}
                <div class="flex items-center justify-center gap-4 rounded-2xl border border-white/15 bg-[#090303]/70 p-4 text-sm text-white/80 shadow-lg backdrop-blur">
                    <button
                        class="rounded-full border border-white/15 px-4 py-1 hover:border-white/40 disabled:opacity-30"
                        on:click={() => codeChallengePage = Math.max(1, codeChallengePage - 1)}
                        disabled={codeChallengePage === 1}
                    >
                        Prev
                    </button>
                    <span>Page {codeChallengePage} of {codeChallengePages}</span>
                    <button
                        class="rounded-full border border-white/15 px-4 py-1 hover:border-white/40 disabled:opacity-30"
                        on:click={() => codeChallengePage = Math.min(codeChallengePages, codeChallengePage + 1)}
                        disabled={codeChallengePage === codeChallengePages}
                    >
                        Next
                    </button>
                </div>
            {/if}
        </section>
    </main>
</div>
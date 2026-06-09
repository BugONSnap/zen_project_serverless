<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { createEventDispatcher, onMount } from 'svelte';

    export let open = false;
    export let username = '';
    export let isAdmin = false;

    const dispatch = createEventDispatcher<{ close: void }>();

    type ManualLink = { label: string; href: string; description: string };

    let currentPage = 0;

    const quickStart = [
        'Use Quick actions on the dashboard to open HTML, CSS, JavaScript, or Advanced JS quizzes.',
        'Open Learn from the header for guided lessons between quiz sessions.',
        'Earn points on correct answers  your rank and leaderboard position follow total points.',
        'Resume interrupted quizzes from the In-progress section when it appears.'
    ];

    const quizRoutes: ManualLink[] = [
        { label: 'HTML', href: '/html', description: 'Semantic structure and document basics.' },
        { label: 'CSS', href: '/css', description: 'Layout, selectors, and styling drills.' },
        { label: 'JavaScript', href: '/javascript', description: 'Core logic and DOM fundamentals.' },
        { label: 'Advanced JS', href: '/advancejs', description: 'Patterns, async, and deeper challenges.' }
    ];

    const learnRoutes: ManualLink[] = [
        { label: 'HTML lessons', href: '/learn', description: 'Step-by-step HTML with search.' },
        { label: 'CSS lessons', href: '/learn/css', description: 'Guided CSS learning path.' },
        { label: 'JavaScript lessons', href: '/learn/javascript-learn', description: 'Guided JS learning path.' },
        { label: 'Advanced JS lessons', href: '/learn/advance-javascript', description: 'Advanced JS topics.' }
    ];

    const socialRoutes: ManualLink[] = [
        { label: 'Code Playground', href: '/playground', description: 'Live HTML/CSS/JS editor with preview and saved snippets.' },
        { label: 'Leaderboard', href: '/leaderboard', description: 'Top learners ranked by points.' },
        { label: 'Community', href: '/community', description: 'Feedback, ratings, likes, and replies.' }
    ];

    const adminRoutes: ManualLink[] = [
        { label: 'Admin home', href: '/admin', description: 'Panel overview.' },
        { label: 'Users', href: '/admin/users', description: 'Manage accounts.' },
        { label: 'Quizzes', href: '/admin/quizzes', description: 'Create and edit quiz content.' },
        { label: 'Analytics', href: '/admin/analytics', description: 'System statistics.' },
        { label: 'Community', href: '/admin/admin_community', description: 'Moderate posts.' }
    ];

    const quizFormats = [
        'Multiple Choice',
        'Complete the Code',
        'Code Challenge',
        'Identification'
    ];

    $: pageLabels = [
        'Welcome',
        'Quick start',
        'Quizzes',
        'Learn & more',
        ...(isAdmin ? ['Admin'] : []),
        'Progress',
        'Tips'
    ];

    $: totalPages = pageLabels.length;
    $: pageIndex = Math.min(currentPage, totalPages - 1);
    $: progressPercent = totalPages > 1 ? ((pageIndex + 1) / totalPages) * 100 : 100;

    /** Map logical slide index to pageLabels index (admin inserts extra slide). */
    $: slideKey = (() => {
        if (pageIndex === 0) return 'welcome';
        if (pageIndex === 1) return 'quickstart';
        if (pageIndex === 2) return 'quizzes';
        if (pageIndex === 3) return 'learn';
        if (isAdmin && pageIndex === 4) return 'admin';
        if (pageIndex === (isAdmin ? 5 : 4)) return 'progress';
        return 'tips';
    })();

    function closeModal() {
        open = false;
        dispatch('close');
    }

    function nextPage() {
        if (pageIndex < totalPages - 1) currentPage = pageIndex + 1;
        else closeModal();
    }

    function prevPage() {
        if (pageIndex > 0) currentPage = pageIndex - 1;
    }

    function goToPage(index: number) {
        currentPage = index;
    }

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) closeModal();
    }

    function handleKeydown(event: KeyboardEvent) {
        if (!open) return;
        if (event.key === 'Escape') closeModal();
        if (event.key === 'ArrowRight') nextPage();
        if (event.key === 'ArrowLeft') prevPage();
    }

    onMount(() => {
        if (open) currentPage = 0;
    });

    $: if (open) currentPage = Math.min(currentPage, Math.max(0, totalPages - 1));
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        class="manual-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
        role="presentation"
        on:click={handleBackdropClick}
        on:keydown={handleKeydown}
        transition:fade={{ duration: 200 }}
    >
        <div
            class="manual-panel relative w-full max-w-lg max-h-[min(90vh,640px)] flex flex-col overflow-hidden rounded-2xl border border-amber-500/30 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-title"
            on:click|stopPropagation
            in:fly={{ y: 24, duration: 280 }}
        >
            <div class="manual-panel-glow pointer-events-none absolute inset-0 rounded-2xl" aria-hidden="true"></div>

            <header class="relative shrink-0 border-b border-white/10 px-5 py-4 sm:px-6">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="text-[10px] uppercase tracking-[0.35em] text-amber-400 font-semibold">User guide</p>
                        <h2 id="manual-title" class="mt-1 truncate text-lg font-bold text-white sm:text-xl">
                            {pageLabels[pageIndex]}
                        </h2>
                        <p class="text-xs text-gray-400 mt-0.5">
                            Step {pageIndex + 1} of {totalPages}
                        </p>
                    </div>
                    <button
                        type="button"
                        class="manual-close shrink-0 rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                        aria-label="Close guide"
                        on:click={closeModal}
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="mt-3 h-1.5 w-full rounded-full bg-gray-700/80 overflow-hidden">
                    <div
                        class="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-300 ease-out"
                        style="width: {progressPercent}%"
                    ></div>
                </div>
            </header>

            <div class="relative flex-1 overflow-y-auto px-5 py-5 sm:px-6 manual-scroll">
                {#key pageIndex}
                    <div in:fly={{ x: 12, duration: 220 }} out:fly={{ x: -12, duration: 180 }}>
                        {#if slideKey === 'welcome'}
                            <div class="text-center sm:text-left">
                                <span class="inline-flex text-4xl mb-3" aria-hidden="true">📘</span>
                                <p class="text-gray-300 text-sm leading-relaxed">
                                    Hi <span class="text-amber-300 font-semibold">{username}</span>  welcome to
                                    <strong class="text-white">Zentry</strong>. This short guide shows where everything lives
                                    after you sign in.
                                </p>
                                <ul class="mt-4 space-y-2 text-sm text-gray-400">
                                    <li class="flex gap-2"><span class="text-amber-500">✓</span> Interactive quizzes by topic</li>
                                    <li class="flex gap-2"><span class="text-amber-500">✓</span> Guided Learn modules</li>
                                    <li class="flex gap-2"><span class="text-amber-500">✓</span> Playground, leaderboard & community</li>
                                </ul>
                            </div>
                        {:else if slideKey === 'quickstart'}
                            <ol class="space-y-3">
                                {#each quickStart as step, i}
                                    <li class="manual-step flex gap-3 rounded-xl border border-white/5 bg-gray-800/40 px-3 py-3 text-sm text-gray-300">
                                        <span class="manual-step-num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600/20 text-xs font-bold text-amber-400">{i + 1}</span>
                                        <span class="pt-0.5">{step}</span>
                                    </li>
                                {/each}
                            </ol>
                        {:else if slideKey === 'quizzes'}
                            <p class="text-xs text-gray-400 mb-3">Account & quiz tracks</p>
                            <ul class="space-y-2 mb-4">
                                <li class="manual-route-card">
                                    <a href="/dashboard" class="manual-link">Dashboard</a>
                                    <span class="text-gray-500 text-xs"> /dashboard</span>
                                    <p class="text-xs text-gray-400 mt-1">Stats, progress, quick actions.</p>
                                </li>
                                <li class="manual-route-card">
                                    <a href="/profile" class="manual-link">Profile</a>
                                    <span class="text-gray-500 text-xs"> /profile</span>
                                    <p class="text-xs text-gray-400 mt-1">Username, progress, account settings.</p>
                                </li>
                            </ul>
                            <p class="text-xs text-gray-400 mb-2">Quiz categories</p>
                            <ul class="space-y-2">
                                {#each quizRoutes as link}
                                    <li class="manual-route-card">
                                        <a href={link.href} class="manual-link">{link.label}</a>
                                        <span class="text-gray-500 text-xs"> {link.href}</span>
                                        <p class="text-xs text-gray-400 mt-1">{link.description}</p>
                                    </li>
                                {/each}
                            </ul>
                        {:else if slideKey === 'learn'}
                            <p class="text-xs text-gray-400 mb-3">Guided lessons</p>
                            <ul class="space-y-2 mb-4">
                                {#each learnRoutes as link}
                                    <li class="manual-route-card">
                                        <a href={link.href} class="manual-link">{link.label}</a>
                                        <span class="text-gray-500 text-xs"> {link.href}</span>
                                        <p class="text-xs text-gray-400 mt-1">{link.description}</p>
                                    </li>
                                {/each}
                            </ul>
                            <p class="text-xs text-gray-400 mb-2">Practice & community</p>
                            <ul class="space-y-2">
                                {#each socialRoutes as link}
                                    <li class="manual-route-card">
                                        <a href={link.href} class="manual-link">{link.label}</a>
                                        <span class="text-gray-500 text-xs"> {link.href}</span>
                                        <p class="text-xs text-gray-400 mt-1">{link.description}</p>
                                    </li>
                                {/each}
                            </ul>
                        {:else if slideKey === 'admin'}
                            <p class="text-sm text-amber-200/90 mb-3">Your account has admin access.</p>
                            <ul class="space-y-2">
                                {#each adminRoutes as link}
                                    <li class="manual-route-card border-amber-500/20">
                                        <a href={link.href} class="manual-link">{link.label}</a>
                                        <span class="text-gray-500 text-xs"> {link.href}</span>
                                        <p class="text-xs text-gray-400 mt-1">{link.description}</p>
                                    </li>
                                {/each}
                            </ul>
                        {:else if slideKey === 'progress'}
                            <div class="space-y-4 text-sm text-gray-300">
                                <div>
                                    <h3 class="text-white font-semibold text-sm mb-2">Challenge formats</h3>
                                    <div class="flex flex-wrap gap-2">
                                        {#each quizFormats as format}
                                            <span class="manual-tag">{format}</span>
                                        {/each}
                                    </div>
                                </div>
                                <p><strong class="text-white">Difficulty:</strong> EASY, MEDIUM, HARD  correct answers add points.</p>
                                <p><strong class="text-white">Progress:</strong> Category progress on the dashboard tracks completed vs total quizzes.</p>
                                <p><strong class="text-white">Resume:</strong> In-progress quizzes appear with a Resume button linking to <code class="text-amber-300/90 text-xs">/quiz</code>.</p>
                                <p><strong class="text-white">Header:</strong> Dashboard, Playground, Learn, Leaderboard, Community, Profile avatar, Logout.</p>
                            </div>
                        {:else}
                            <ul class="space-y-3 text-sm text-gray-300">
                                <li class="manual-tip">
                                    <strong class="text-white">Playground</strong>  live preview, console, save snippets.
                                </li>
                                <li class="manual-tip">
                                    <strong class="text-white">Profile</strong>  progress, username, user type (Student / Professional / Hobbyist).
                                </li>
                                <li class="manual-tip">
                                    <strong class="text-white">Community</strong>  post with 1–5 stars; like, dislike, or reply.
                                </li>
                            </ul>
                            <p class="mt-4 text-center text-xs text-gray-500">You’re ready  explore from Quick actions below.</p>
                        {/if}
                    </div>
                {/key}
            </div>

            <footer class="relative shrink-0 border-t border-white/10 bg-black/20 px-5 py-4 sm:px-6">
                <div class="flex items-center justify-center gap-1.5 mb-4" role="tablist" aria-label="Guide pages">
                    {#each pageLabels as _, i}
                        <button
                            type="button"
                            class="manual-dot h-2 rounded-full transition-all duration-200 {i === pageIndex ? 'w-6 bg-amber-500' : 'w-2 bg-gray-600 hover:bg-gray-500'}"
                            aria-label="Go to page {i + 1}: {pageLabels[i]}"
                            aria-current={i === pageIndex ? 'step' : undefined}
                            on:click={() => goToPage(i)}
                        ></button>
                    {/each}
                </div>
                <div class="flex gap-3">
                    <button
                        type="button"
                        class="manual-btn-secondary flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
                        disabled={pageIndex === 0}
                        on:click={prevPage}
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        class="manual-btn-primary flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold"
                        on:click={nextPage}
                    >
                        {pageIndex < totalPages - 1 ? 'Next' : 'Got it'}
                    </button>
                </div>
            </footer>
        </div>
    </div>
{/if}

<style>
    .manual-overlay {
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    }
    .manual-panel {
        background: linear-gradient(145deg, #1a1f2e 0%, #111827 55%, #0f172a 100%);
        font-family: 'Poppins', Arial, sans-serif;
        box-shadow:
            0 0 0 1px rgba(217, 119, 6, 0.15),
            0 25px 50px -12px rgba(0, 0, 0, 0.6);
    }
    .manual-panel-glow {
        background: radial-gradient(ellipse at 50% 0%, rgba(217, 119, 6, 0.12) 0%, transparent 55%);
    }
    .manual-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(217, 119, 6, 0.4) transparent;
    }
    .manual-link {
        color: #fbbf24;
        font-weight: 600;
        font-size: 0.875rem;
        text-decoration: none;
    }
    .manual-link:hover {
        color: #d97706;
        text-decoration: underline;
        text-underline-offset: 2px;
    }
    .manual-route-card {
        border-radius: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: rgba(31, 41, 55, 0.45);
        padding: 0.65rem 0.85rem;
    }
    .manual-step-num {
        border: 1px solid rgba(217, 119, 6, 0.25);
    }
    .manual-tag {
        font-size: 0.7rem;
        padding: 0.25rem 0.5rem;
        border-radius: 9999px;
        background: rgba(217, 119, 6, 0.15);
        color: #fcd34d;
        border: 1px solid rgba(217, 119, 6, 0.25);
    }
    .manual-tip {
        padding: 0.65rem 0.85rem;
        border-radius: 0.75rem;
        background: rgba(31, 41, 55, 0.4);
        border-left: 3px solid #d97706;
    }
    .manual-btn-primary {
        background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
        color: #111827;
        box-shadow: 0 4px 14px rgba(217, 119, 6, 0.35);
    }
    .manual-btn-primary:hover {
        filter: brightness(1.08);
    }
    .manual-btn-secondary {
        color: #e5e7eb;
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.05);
    }
    .manual-btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(217, 119, 6, 0.35);
    }
</style>

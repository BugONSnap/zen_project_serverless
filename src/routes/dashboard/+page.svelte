<script lang="ts">
    import type { PageData } from './$types';
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    export let data: PageData;

    // State for dashboard data from server
    let stats = [
        { title: 'Total Points', value: data.totalPoints > 0 ? data.totalPoints.toString() : 'Haven\'t started', icon: '🏆', color: 'bg-blue-500' },
        { title: 'Quizzes Completed', value: data.totalCompleted > 0 ? data.totalCompleted.toString() : 'Haven\'t started', icon: '📝', color: 'bg-green-500' }
    ];

    type Category = {
        id: number;
        name: string;
        completed: number;
        total: number;
        progress: number;
    };

    let categories: Category[] = data.categories;

    // In-progress quiz attempts
    let inProgressAttempts: any[] = [];

    onMount(async () => {
        try {
            const res = await fetch('/api/profile/progress');
            if (res.ok) {
                const result = await res.json();
                inProgressAttempts = result.attempts || [];
            }
        } catch (e) {
            // Ignore errors
        }
    });
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Poppins:wght@700&display=swap');

.dashboard-bg, body, html {
    font-family: 'Montserrat', Arial, sans-serif;
}
h1, h2, h3, h4, h5, h6, .dashboard-heading {
    font-family: 'Poppins', Arial, sans-serif;
    font-weight: 700;
}
p, span, small, .dashboard-body, .text-sm, .text-xs {
    font-family: 'Montserrat', Arial, sans-serif;
}
.dashboard-heading {
    font-size: 2.5rem;
}
.dashboard-subheading {
    font-size: 1.5rem;
    font-family: 'Montserrat', Arial, sans-serif;
    font-weight: 600;
}
.dashboard-stat {
    font-size: 2rem;
    font-family: 'Poppins', Arial, sans-serif;
    font-weight: 700;
}
.dashboard-body {
    font-size: 1.1rem;
    font-family: 'Montserrat', Arial, sans-serif;
}
</style>

<div class="min-h-screen text-[#4a1c1c] font-medium relative overflow-hidden dashboard-bg" style="background: linear-gradient(to bottom, #ffbdbd 0%, #ff9b9b 50%, #ff7b7b 100%);">
    <!-- Subtle pattern overlay -->
    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#ff4d4d 1px, transparent 1px); background-size: 20px 20px;"></div>
    <DashboardHeader title="Dashboard" user={data.user} />

    <main class="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {#if inProgressAttempts.length > 0}
            <section class="rounded-3xl border-2 border-white/30 bg-gradient-to-r from-[#ff9b9b] to-[#ffb6b6] p-6 shadow-lg backdrop-blur">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs uppercase tracking-[0.3em] text-[#7a2a2a]">Resume</p>
                        <h2 class="text-2xl font-semibold text-[#4a1c1c]">In-progress quizzes</h2>
                    </div>
                </div>
                <ul class="mt-4 divide-y divide-white/10">
                    {#each inProgressAttempts as attempt}
                        <li class="py-4 flex items-center justify-between text-white/90">
                            <div>
                                <p class="font-semibold">{attempt.title}</p>
                                <p class="text-sm text-white/60">Step {attempt.currentStep + 1}</p>
                            </div>
                            <button
                                class="rounded-full border border-amber-200 px-4 py-1 text-sm text-amber-100 hover:bg-amber-300/20 transition"
                                on:click={() => goto(`/quiz?category=${attempt.categoryId}&id=${attempt.quizId}`)}
                            >
                                Resume
                            </button>
                        </li>
                    {/each}
                </ul>
            </section>
        {/if}

        <section class="rounded-3xl border-2 border-white/30 bg-gradient-to-br from-[#ffb0b0] to-[#ffd4d4] p-8 shadow-lg backdrop-blur">
            <p class="text-xs uppercase tracking-[0.35em] text-[#7a2a2a]">Launch pads</p>
            <h2 class="mt-2 text-3xl font-semibold text-[#4a1c1c]">Quick actions</h2>
            <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button class="rounded-2xl border border-white/15 bg-white/5 p-4 text-left hover:border-emerald-400/60 transition" on:click={() => goto('/css')}>
                    <div class="flex items-center gap-3">
                        <img src="/CSS.png" alt="CSS Logo" class="h-10 w-10 object-contain" />
                        <div>
                            <p class="text-lg font-semibold text-[#4a1c1c]">CSS</p>
                            <p class="text-[#7a2a2a] text-sm">Layout drills & utilities</p>
                        </div>
                    </div>
                </button>
                <button class="rounded-2xl border border-white/15 bg-white/5 p-4 text-left hover:border-emerald-400/60 transition" on:click={() => goto('/html')}>
                    <div class="flex items-center gap-3">
                        <img src="/HTML.png" alt="HTML Logo" class="h-10 w-10 object-contain" />
                        <div>
                            <p class="text-lg font-semibold text-[#4a1c1c]">HTML</p>
                            <p class="text-[#7a2a2a] text-sm">Semantic structures</p>
                        </div>
                    </div>
                </button>
                <button class="rounded-2xl border border-white/15 bg-white/5 p-4 text-left hover:border-emerald-400/60 transition" on:click={() => goto('/javascript')}>
                    <div class="flex items-center gap-3">
                        <img src="/JS.webp" alt="JS Logo" class="h-10 w-10 object-contain" />
                        <div>
                            <p class="text-lg font-semibold text-[#4a1c1c]">JavaScript</p>
                            <p class="text-[#7a2a2a] text-sm">Core logic workouts</p>
                        </div>
                    </div>
                </button>
                <button class="rounded-2xl border border-white/15 bg-white/5 p-4 text-left hover:border-emerald-400/60 transition" on:click={() => goto('/advancejs')}>
                    <div class="flex items-center gap-3">
                        <img src="/JS.webp" alt="Advanced JS Logo" class="h-10 w-10 object-contain" />
                        <div>
                            <p class="text-lg font-semibold text-[#4a1c1c]">Advanced JS</p>
                            <p class="text-[#7a2a2a] text-sm">Patterns & async mastery</p>
                        </div>
                    </div>
                </button>
                <button class="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-left hover:border-emerald-300/70 transition" on:click={() => goto('/playground')}>
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">🚀</span>
                        <div>
                            <p class="text-lg font-semibold text-[#4a1c1c]">Code Playground</p>
                            <p class="text-[#7a2a2a] text-sm">Experiment in real-time</p>
                        </div>
                    </div>
                </button>
            </div>
        </section>

        <section class="grid gap-6 md:grid-cols-2">
            {#each stats as stat}
                <article class="rounded-3xl border-2 border-white/30 bg-gradient-to-r from-[#ffb0b0] to-[#ffd4d4] p-6 shadow-lg backdrop-blur flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
                    <div class="text-4xl">{stat.icon}</div>
                    <div>
                        <p class="text-sm uppercase tracking-[0.3em] text-[#7a2a2a]">{stat.title}</p>
                        <p class="mt-2 text-2xl font-semibold text-[#4a1c1c]">{stat.value}</p>
                    </div>
                </article>
            {/each}
        </section>

        <section class="rounded-3xl border-2 border-white/30 bg-gradient-to-br from-[#ffb0b0] to-[#ffd4d4] p-8 shadow-lg backdrop-blur">
            <div class="flex flex-col gap-2">
                <p class="text-xs uppercase tracking-[0.35em] text-[#7a2a2a]">Your journey</p>
                <h2 class="text-3xl font-semibold text-[#4a1c1c]">Category progress</h2>
                <p class="text-[#7a2a2a]">Track how far you've gone in each track. Finish a module to unlock deeper drills.</p>
            </div>
            <ul class="mt-6 space-y-6">
                {#each categories as category}
                    <li class="rounded-2xl border-2 border-white/30 bg-gradient-to-r from-[#ffb0b0] to-[#ffd4d4] p-5 shadow-md hover:shadow-lg transition-all duration-300">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-lg font-semibold text-[#4a1c1c]">{category.name}</p>
                                <p class="text-sm text-[#7a2a2a]">{category.completed} of {category.total} quizzes completed</p>
                            </div>
                            <span class="text-sm font-bold text-[#ff6b6b]">{category.progress}%</span>
                        </div>
                        <div class="mt-3 h-3 w-full rounded-full bg-white/30">
                            <div class="h-3 rounded-full bg-gradient-to-r from-[#ff9b9b] to-[#ff6b6b]" style={`width: ${category.progress}%`}></div>
                        </div>
                    </li>
                {/each}
            </ul>
        </section>
    </main>
</div>
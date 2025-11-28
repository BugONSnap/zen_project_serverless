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
    font-family: 'Poppins', Arial, sans-serif;
}
h1, h2, h3, h4, h5, h6, .dashboard-heading {
    font-family: 'Poppins', Arial, sans-serif;
    font-weight: 700;
    color: white;
}
p, span, small, .dashboard-body, .text-sm, .text-xs {
    font-family: 'Poppins', Arial, sans-serif;
    color: #e5e7eb;
}
.dashboard-heading {
    font-size: 2.5rem;
}
.dashboard-subheading {
    font-size: 1.5rem;
    font-family: 'Poppins', Arial, sans-serif;
    font-weight: 600;
}
.dashboard-stat {
    font-size: 2rem;
    font-family: 'Poppins', Arial, sans-serif;
    font-weight: 700;
}
.dashboard-body {
    font-size: 1.1rem;
    font-family: 'Poppins', Arial, sans-serif;
}
.glass-card {
    background: rgba(31, 41, 55, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(31, 41, 55, 0.37);
}
.glass-card-hover {
    transition: all 0.3s ease;
}
.glass-card-hover:hover {
    background: rgba(55, 65, 81, 0.8);
    border-color: rgba(217, 119, 6, 0.3);
    box-shadow: 0 8px 32px 0 rgba(217, 119, 6, 0.15);
    transform: translateY(-2px);
}
.gold-accent {
    color: #d97706;
}
.gold-border {
    border-color: rgba(217, 119, 6, 0.3);
}
</style>

<div class="min-h-screen text-white font-medium relative overflow-hidden dashboard-bg" style="background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%); font-family: poppins;">
    <!-- Animated gradient overlay -->
    <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
    <!-- Subtle dot pattern -->
    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>
    <DashboardHeader title="Dashboard" user={data.user} pageName="Dashboard" />

    <main class="max-w-6xl mx-auto px-4 py-10 space-y-10 relative z-10">
        {#if inProgressAttempts.length > 0}
            <section class="glass-card rounded-3xl p-6 shadow-2xl">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <p class="text-xs uppercase tracking-[0.3em] text-[#d97706] font-semibold">Resume</p>
                        <h2 class="text-2xl font-bold text-white mt-2">In-progress quizzes</h2>
                    </div>
                </div>
                <ul class="space-y-3">
                    {#each inProgressAttempts as attempt}
                        <li class="glass-card rounded-xl p-4 flex items-center justify-between hover:bg-gray-700/40 transition-all duration-300">
                            <div>
                                <p class="font-semibold text-white">{attempt.title}</p>
                                <p class="text-sm text-gray-400">Step {attempt.currentStep + 1}</p>
                            </div>
                            <button
                                class="rounded-full border border-[#d97706]/50 px-4 py-2 text-sm text-[#d97706] hover:bg-[#d97706]/10 hover:border-[#d97706] transition-all duration-300 font-semibold"
                                on:click={() => goto(`/quiz?category=${attempt.categoryId}&id=${attempt.quizId}`)}
                            >
                                Resume
                            </button>
                        </li>
                    {/each}
                </ul>
            </section>
        {/if}

        <section class="glass-card rounded-3xl p-8 shadow-2xl">
            <p class="text-xs uppercase tracking-[0.35em] text-[#d97706] font-semibold">Launch pads</p>
            <h2 class="mt-4 text-3xl font-bold text-white">Quick actions</h2>
            <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button class="glass-card glass-card-hover rounded-2xl p-6 text-left group" on:click={() => goto('/css')}>
                    <div class="flex items-center gap-4">
                        <img src="/CSS.png" alt="CSS Logo" class="h-12 w-12 object-contain group-hover:scale-110 transition-transform duration-300" />
                        <div>
                            <p class="text-lg font-bold text-white">CSS</p>
                            <p class="text-gray-400 text-sm mt-1">Layout drills & utilities</p>
                        </div>
                    </div>
                </button>
                <button class="glass-card glass-card-hover rounded-2xl p-6 text-left group" on:click={() => goto('/html')}>
                    <div class="flex items-center gap-4">
                        <img src="/HTML.png" alt="HTML Logo" class="h-12 w-12 object-contain group-hover:scale-110 transition-transform duration-300" />
                        <div>
                            <p class="text-lg font-bold text-white">HTML</p>
                            <p class="text-gray-400 text-sm mt-1">Semantic structures</p>
                        </div>
                    </div>
                </button>
                <button class="glass-card glass-card-hover rounded-2xl p-6 text-left group" on:click={() => goto('/javascript')}>
                    <div class="flex items-center gap-4">
                        <img src="/JS.webp" alt="JS Logo" class="h-12 w-12 object-contain group-hover:scale-110 transition-transform duration-300" />
                        <div>
                            <p class="text-lg font-bold text-white">JavaScript</p>
                            <p class="text-gray-400 text-sm mt-1">Core logic workouts</p>
                        </div>
                    </div>
                </button>
                <button class="glass-card glass-card-hover rounded-2xl p-6 text-left group" on:click={() => goto('/advancejs')}>
                    <div class="flex items-center gap-4">
                        <img src="/JS.webp" alt="Advanced JS Logo" class="h-12 w-12 object-contain group-hover:scale-110 transition-transform duration-300" />
                        <div>
                            <p class="text-lg font-bold text-white">Advanced JS</p>
                            <p class="text-gray-400 text-sm mt-1">Patterns & async mastery</p>
                        </div>
                    </div>
                </button>
                <button class="glass-card glass-card-hover rounded-2xl p-6 text-left group border-[#d97706]/30 hover:border-[#d97706]/60" on:click={() => goto('/playground')}>
                    <div class="flex items-center gap-4">
                        <span class="text-4xl group-hover:scale-110 transition-transform duration-300">🚀</span>
                        <div>
                            <p class="text-lg font-bold text-white">Code Playground</p>
                            <p class="text-gray-400 text-sm mt-1">Experiment in real-time</p>
                        </div>
                    </div>
                </button>
            </div>
        </section>

        <section class="grid gap-6 md:grid-cols-2">
            {#each stats as stat}
                <article class="glass-card glass-card-hover rounded-3xl p-6 shadow-lg flex items-center gap-6">
                    <div class="text-5xl filter drop-shadow-lg">{stat.icon}</div>
                    <div>
                        <p class="text-xs uppercase tracking-[0.3em] text-[#d97706] font-semibold">{stat.title}</p>
                        <p class="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                </article>
            {/each}
        </section>

        <section class="glass-card rounded-3xl p-8 shadow-2xl">
            <div class="flex flex-col gap-2 mb-8">
                <p class="text-xs uppercase tracking-[0.35em] text-[#d97706] font-semibold">Your journey</p>
                <h2 class="text-3xl font-bold text-white">Category progress</h2>
                <p class="text-gray-400 mt-2">Track how far you've gone in each track. Finish a module to unlock deeper drills.</p>
            </div>
            <ul class="space-y-4">
                {#each categories as category}
                    <li class="glass-card rounded-2xl p-6 hover:bg-gray-700/40 transition-all duration-300">
                        <div class="flex items-center justify-between mb-3">
                            <div>
                                <p class="text-lg font-bold text-white">{category.name}</p>
                                <p class="text-sm text-gray-400 mt-1">{category.completed} of {category.total} quizzes completed</p>
                            </div>
                            <span class="text-lg font-bold text-[#d97706]">{category.progress}%</span>
                        </div>
                        <div class="h-2 w-full rounded-full bg-gray-700/50 overflow-hidden">
                            <div class="h-2 rounded-full bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#fbbf24] shadow-lg" style={`width: ${category.progress}%; transition: width 0.5s ease;`}></div>
                        </div>
                    </li>
                {/each}
            </ul>
        </section>
    </main>
</div>
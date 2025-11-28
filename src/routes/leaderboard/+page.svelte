<script lang="ts">
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    export let data;
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

/* Mobile styles */
.leaderboard-table {
    display: table;
    width: 100%;
    border-collapse: collapse;
}

.leaderboard-card {
    display: none;
}

.rank-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Mobile styles */
@media (max-width: 768px) {
    .leaderboard-table {
        display: none;
    }
    
    .leaderboard-card {
        display: block;
        background: rgba(31, 41, 55, 0.6);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid rgba(107, 114, 128, 0.5);
    }
    
    .card-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    
    .card-label {
        font-weight: 600;
        color: #9ca3af;
    }
    
    .card-value {
        color: #d1d5db;
    }
    
    .card-rank {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
        color: #f3f4f6;
    }
}
</style>

<div class="min-h-screen text-white font-medium relative overflow-hidden dashboard-bg" style="background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%); font-family: poppins;">
    <!-- Animated gradient overlay -->
    <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
    <!-- Subtle dot pattern -->
    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>
    <DashboardHeader title="Leaderboard" user={data.user} pageName="Leaderboard" />

    <section class="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div class="rounded-3xl border-2 border-gray-700 p-8 shadow-lg backdrop-blur" style="background: linear-gradient(to right, #111827 0%, #0f0f0f 50%, #111827 100%)">
            <div class="text-center space-y-2 mb-8">
                <p class="text-xs uppercase tracking-[0.35em] text-gray-400 font-semibold">Top Performers</p>
                <h1 class="text-4xl font-semibold text-white">🏆 Leaderboard</h1>
                <p class="text-gray-300">Real-time snapshot of the brightest builders in Zentry.</p>
            </div>
            <div class="overflow-x-auto">
                <!-- Desktop Table View -->
                <table class="leaderboard-table min-w-full divide-y divide-gray-700 text-left text-sm">
                    <thead>
                        <tr class="text-gray-300 border-b border-gray-700 bg-gray-900/50">
                            <th class="px-4 py-3 font-medium uppercase tracking-[0.3em] text-gray-400">Rank</th>
                            <th class="px-4 py-3 font-medium uppercase tracking-[0.3em] text-gray-400">Username</th>
                            <th class="px-4 py-3 font-medium uppercase tracking-[0.3em] text-right text-gray-400">Total Points</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-800">
                        {#each data.leaderboard as entry}
                            <tr class="hover:bg-gray-900/40 transition">
                                <td class="px-4 py-4 rank-cell font-semibold text-amber-400">
                                    {#if entry.rank === 1}
                                        <span>🥇</span>
                                    {:else if entry.rank === 2}
                                        <span>🥈</span>
                                    {:else if entry.rank === 3}
                                        <span>🥉</span>
                                    {/if}
                                    <span>{entry.rank}</span>
                                </td>
                                <td class="px-4 py-4 text-gray-300">{entry.username}</td>
                                <td class="px-4 py-4 text-right text-amber-400 font-semibold">{entry.total_points != null ? entry.total_points : 0}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>

                <!-- Mobile Card View -->
                <div class="leaderboard-cards">
                    {#each data.leaderboard as entry}
                        <div class="leaderboard-card">
                            <div class="card-rank">
                                {#if entry.rank === 1}
                                    <span>🥇</span>
                                {:else if entry.rank === 2}
                                    <span>🥈</span>
                                {:else if entry.rank === 3}
                                    <span>🥉</span>
                                    {:else}
                                    <span>#{entry.rank}</span>
                                {/if}
                                <span>{entry.username}</span>
                            </div>
                            <div class="card-row">
                                <span class="card-label">Rank:</span>
                                <span class="card-value">{entry.rank}</span>
                            </div>
                            <div class="card-row">
                                <span class="card-label">Username:</span>
                                <span class="card-value">{entry.username}</span>
                            </div>
                            <div class="card-row">
                                <span class="card-label">Points:</span>
                                <span class="card-value font-semibold text-amber-400">{entry.total_points != null ? entry.total_points : 0}</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </section>
</div>
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
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .card-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    
    .card-label {
        font-weight: 600;
        color: #7a2a2a;
    }
    
    .card-value {
        color: #4a1c1c;
    }
    
    .card-rank {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
}
</style>

<div class="min-h-screen text-[#4a1c1c] font-medium relative overflow-hidden dashboard-bg" style="background: linear-gradient(to bottom, #ffd7d7 0%, #ffd2d2 50%, #ffcac5 100%);">
    <DashboardHeader title="Leaderboard" user={data.user} />

    <section class="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div class="rounded-3xl border-2 border-white/30 p-8 shadow-lg backdrop-blur" style="background:linear-gradient(to right, #ffbdbd 0%, #ff9b9b 50%, #ff7b7b 100%); font-color:#4a1c1c">
            <div class="text-center space-y-2 mb-8">
                <p class="text-xs uppercase tracking-[0.35em] text-[#7a2a2a]">Top Performers</p>
                <h1 class="text-4xl font-semibold text-[#4a1c1c]">🏆 Leaderboard</h1>
                <p class="text-[#7a2a2a]">Real-time snapshot of the brightest builders in Zentry.</p>
            </div>
            <div class="overflow-x-auto">
                <!-- Desktop Table View -->
                <table class="leaderboard-table min-w-full divide-y divide-white/10 text-left text-sm">
                    <thead>
                        <tr class="text-[#7a2a2a]">
                            <th class="px-4 py-3 font-medium uppercase tracking-[0.3em]">Rank</th>
                            <th class="px-4 py-3 font-medium uppercase tracking-[0.3em]">Username</th>
                            <th class="px-4 py-3 font-medium uppercase tracking-[0.3em] text-right">Total Points</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                        {#each data.leaderboard as entry}
                            <tr class="hover:bg-white/5 transition">
                                <td class="px-4 py-4 rank-cell font-semibold text-[#4a1c1c]">
                                    {#if entry.rank === 1}
                                        <span>🥇</span>
                                    {:else if entry.rank === 2}
                                        <span>🥈</span>
                                    {:else if entry.rank === 3}
                                        <span>🥉</span>
                                    {/if}
                                    <span>{entry.rank}</span>
                                </td>
                                <td class="px-4 py-4 text-[#4a1c1c]">{entry.username}</td>
                                <td class="px-4 py-4 text-right text-emerald-200 font-semibold">{entry.total_points != null ? entry.total_points : 0}</td>
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
                                <span class="card-value font-semibold text-emerald-200">{entry.total_points != null ? entry.total_points : 0}</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </section>
</div>
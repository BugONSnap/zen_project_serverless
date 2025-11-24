<script lang="ts">
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    export let data;
</script>

<div class="min-h-screen bg-gradient-to-b from-[#FF0606] via-[#6F1414] to-[#050202] text-white">
    <DashboardHeader title="Leaderboard" user={data.user} />

    <section class="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div class="rounded-3xl border border-white/15 bg-black/30 p-8 shadow-2xl backdrop-blur">
            <div class="text-center space-y-2 mb-8">
                <p class="text-xs uppercase tracking-[0.35em] text-white/60">Top Performers</p>
                <h1 class="text-4xl font-semibold text-white">🏆 Leaderboard</h1>
                <p class="text-white/70">Real-time snapshot of the brightest builders in Zentry.</p>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-white/10 text-left text-sm">
                    <thead>
                        <tr class="text-white/70">
                            <th class="px-4 py-3 font-medium uppercase tracking-[0.3em]">Rank</th>
                            <th class="px-4 py-3 font-medium uppercase tracking-[0.3em]">Username</th>
                            <th class="px-4 py-3 font-medium uppercase tracking-[0.3em] text-right">Total Points</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                        {#each data.leaderboard as entry}
                            <tr class="hover:bg-white/5 transition">
                                <td class="px-4 py-4 flex items-center gap-2 font-semibold text-white">
                                    {#if entry.rank === 1}
                                        <span>🥇</span>
                                    {:else if entry.rank === 2}
                                        <span>🥈</span>
                                    {:else if entry.rank === 3}
                                        <span>🥉</span>
                                    {/if}
                                    <span>{entry.rank}</span>
                                </td>
                                <td class="px-4 py-4 text-white/90">{entry.username}</td>
                                <td class="px-4 py-4 text-right text-emerald-200 font-semibold">{entry.total_points != null ? entry.total_points : 0}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</div>
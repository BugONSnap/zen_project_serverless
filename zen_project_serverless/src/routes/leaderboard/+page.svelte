<script lang="ts">
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    export let data;
</script>

<div class="min-h-screen bg-cover bg-center" style="background-image: url('/BG.jpg');">
    <DashboardHeader title="Leaderboard" />

    <div class="max-w-2xl mx-auto py-12">
        <div class="bg-white rounded-xl shadow-lg p-8">
            <h1 class="text-3xl font-bold mb-8 text-center text-indigo-800">🏆 Leaderboard</h1>
            <div class="overflow-x-auto">
                <table class="min-w-full rounded">
                    <thead>
                        <tr>
                            <th class="px-4 py-2 text-left">Rank</th>
                            <th class="px-4 py-2 text-left">Username</th>
                            <th class="px-4 py-2 text-left">Total Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data.leaderboard as entry, i}
                            <tr class="border-t hover:bg-gray-50 {i === 0 ? 'bg-yellow-100 font-bold' : i === 1 ? 'bg-gray-200 font-semibold' : i === 2 ? 'bg-orange-100 font-semibold' : ''}">
                                <td class="px-4 py-2 text-center">
                                    {#if entry.rank === 1}
                                        🥇
                                    {:else if entry.rank === 2}
                                        🥈
                                    {:else if entry.rank === 3}
                                        🥉
                                    {/if}
                                    {entry.rank}
                                </td>
                                <td class="px-4 py-2">{entry.username}</td>
                                <td class="px-4 py-2 text-center">{entry.total_points ?? 0}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<style>
table {
    border-collapse: collapse;
    width: 100%;
}
th, td {
    border-bottom: 1px solid #e5e7eb;
}
th {
    background: #f3f4f6;
    font-weight: 700;
}
.bg-yellow-100 {
    background: #fef9c3 !important;
}
.bg-gray-200 {
    background: #e5e7eb !important;
}
.bg-orange-100 {
    background: #ffedd5 !important;
}
</style> 
<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    // Placeholder for translation function
type TFunc = (s: string) => string;
const t: TFunc = (s) => s; // Replace with your i18n lib if needed

    export let data: {
    totalUsers: number;
    usersWithProgress: number;
    sectionCounts: Record<string, number>;
    error?: string;
};

    let htmlChart: HTMLCanvasElement | null = null;
let cssChart: HTMLCanvasElement | null = null;
let jsChart: HTMLCanvasElement | null = null;
let advJsChart: HTMLCanvasElement | null = null;

    import type { Chart as ChartType } from 'chart.js/auto';

let htmlChartInstance: ChartType | null = null;
let cssChartInstance: ChartType | null = null;
let jsChartInstance: ChartType | null = null;
let advJsChartInstance: ChartType | null = null;

onMount(() => {
    // Clean up old chart instances to prevent memory leaks
    htmlChartInstance?.destroy();
    cssChartInstance?.destroy();
    jsChartInstance?.destroy();
    advJsChartInstance?.destroy();

    if (htmlChart && cssChart && jsChart && advJsChart && data && data.sectionCounts) {
        htmlChartInstance = new Chart(htmlChart, {
            type: 'bar',
            data: {
                labels: [t('HTML')],
                datasets: [{ label: t('Users Started HTML'), data: [data.sectionCounts['HTML'] ?? 0], backgroundColor: '#f87171' }]
            },
            options: { plugins: { legend: { display: false } } }
        });
        cssChartInstance = new Chart(cssChart, {
            type: 'bar',
            data: {
                labels: [t('CSS')],
                datasets: [{ label: t('Users Started CSS'), data: [data.sectionCounts['CSS'] ?? 0], backgroundColor: '#60a5fa' }]
            },
            options: { plugins: { legend: { display: false } } }
        });
        jsChartInstance = new Chart(jsChart, {
            type: 'bar',
            data: {
                labels: [t('JS')],
                datasets: [{ label: t('Users Started JS'), data: [data.sectionCounts['JS'] ?? 0], backgroundColor: '#facc15' }]
            },
            options: { plugins: { legend: { display: false } } }
        });
        advJsChartInstance = new Chart(advJsChart, {
            type: 'bar',
            data: {
                labels: [t('Advanced JS')],
                datasets: [{ label: t('Users Started Advanced JS'), data: [data.sectionCounts['Advanced JS'] ?? 0], backgroundColor: '#34d399' }]
            },
            options: { plugins: { legend: { display: false } } }
        });
    }
});
</script>

<div class="analytics-bg min-h-screen flex flex-col items-center justify-start py-10 px-2 md:px-0">
    <div class="w-full max-w-4xl">
        <h1 class="text-3xl md:text-4xl font-extrabold mb-8 text-center tracking-tight text-white drop-shadow-lg">{t('Analytics Dashboard')}</h1>
        {#if data.error}
            <div class="bg-red-200/80 text-red-900 p-3 rounded-xl mb-6 shadow-lg text-center font-semibold backdrop-blur-md">{data.error}</div>
        {/if}
        <div class="flex flex-col md:flex-row gap-6 mb-8 justify-center">
            <div class="glass-card flex-1 flex flex-col items-center p-6">
                <div class="text-blue-600 text-lg font-semibold flex items-center gap-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5"/><circle cx="12" cy="7" r="4"/></svg>
                    {t('Total Users')}
                </div>
                <div class="text-4xl font-bold mt-2">{data.totalUsers}</div>
            </div>
            <div class="glass-card flex-1 flex flex-col items-center p-6">
                <div class="text-green-600 text-lg font-semibold flex items-center gap-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 16v4m0 0l3-3m-3 3l-3-3"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
                    {t('Users With Progress')}
                </div>
                <div class="text-4xl font-bold mt-2">{data.usersWithProgress}</div>
            </div>
        </div>
        <div class="glass-card mb-10 p-6">
            <p class="mb-3 text-gray-900 text-base md:text-lg font-medium">{t('There are')} <span class="font-bold text-blue-700">{data.totalUsers}</span> {t('users in total')}, {t('of which')} <span class="font-bold text-green-700">{data.usersWithProgress}</span> {t('have started making progress.')}</p>
            <ul class="list-disc pl-6 space-y-1">
                <li><span class="text-blue-700 font-semibold">{t('HTML Section')}</span>: <span class="font-bold">{data.sectionCounts['HTML'] ?? 0}</span> {t('users have started this section.')}</li>
                <li><span class="text-blue-500 font-semibold">{t('CSS Section')}</span>: <span class="font-bold">{data.sectionCounts['CSS'] ?? 0}</span> {t('users have started this section.')}</li>
                <li><span class="text-yellow-600 font-semibold">{t('JS Section')}</span>: <span class="font-bold">{data.sectionCounts['JS'] ?? 0}</span> {t('users have started this section.')}</li>
                <li><span class="text-green-600 font-semibold">{t('Advanced JS Section')}</span>: <span class="font-bold">{data.sectionCounts['Advanced JS'] ?? 0}</span> {t('users have started this section.')}</li>
            </ul>
        </div>
        <h2 class="text-2xl font-bold mb-6 text-center text-white drop-shadow">{t('Section Progress')}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div class="glass-card p-5 flex flex-col items-center">
                <h3 class="font-semibold mb-3 text-blue-700 text-lg">{t('HTML Section')}</h3>
                <canvas bind:this={htmlChart}></canvas>
            </div>
            <div class="glass-card p-5 flex flex-col items-center">
                <h3 class="font-semibold mb-3 text-blue-500 text-lg">{t('CSS Section')}</h3>
                <canvas bind:this={cssChart}></canvas>
            </div>
            <div class="glass-card p-5 flex flex-col items-center">
                <h3 class="font-semibold mb-3 text-yellow-600 text-lg">{t('JS Section')}</h3>
                <canvas bind:this={jsChart}></canvas>
            </div>
            <div class="glass-card p-5 flex flex-col items-center">
                <h3 class="font-semibold mb-3 text-green-600 text-lg">{t('Advanced JS Section')}</h3>
                <canvas bind:this={advJsChart}></canvas>
            </div>
        </div>
    </div>
</div>

<style>
.analytics-bg {
    background: linear-gradient(trasparent, transparent), url('/static/BG.jpg');
    background-size: cover;
    background-position: center;
    position: relative;
}
.glass-card {
    background: rgba(255, 255, 255, 0.55);
    border-radius: 1.25rem;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    transition: box-shadow 0.2s;
}
.glass-card:hover {
    box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.22);
}
</style>
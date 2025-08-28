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

<div class="p-6">
    <h1 class="text-2xl font-bold mb-4">{t('Analytics Dashboard')}</h1>
    {#if data.error}
        <div class="bg-red-100 text-red-800 p-2 rounded mb-4">{data.error}</div>
    {/if}
    <div class="mb-6 flex gap-8">
        <div class="bg-blue-100 p-4 rounded shadow">
            <div class="text-lg font-semibold">{t('Total Users')}</div>
            <div class="text-3xl">{data.totalUsers}</div>
        </div>
        <div class="bg-green-100 p-4 rounded shadow">
            <div class="text-lg font-semibold">{t('Users With Progress')}</div>
            <div class="text-3xl">{data.usersWithProgress}</div>
        </div>
    </div>
    <div class="mb-8">
        <div class="mb-6 bg-gray-50 p-4 rounded shadow text-gray-800">
            <p class="mb-2">{t('There are')} <span class="font-bold">{data.totalUsers}</span> {t('users in total')}, {t('of which')} <span class="font-bold">{data.usersWithProgress}</span> {t('have started making progress.')}</p>
            <ul class="list-disc pl-6">
                <li>{t('HTML Section')}: <span class="font-bold">{data.sectionCounts['HTML'] ?? 0}</span> {t('users have started this section.')}</li>
                <li>{t('CSS Section')}: <span class="font-bold">{data.sectionCounts['CSS'] ?? 0}</span> {t('users have started this section.')}</li>
                <li>{t('JS Section')}: <span class="font-bold">{data.sectionCounts['JS'] ?? 0}</span> {t('users have started this section.')}</li>
                <li>{t('Advanced JS Section')}: <span class="font-bold">{data.sectionCounts['Advanced JS'] ?? 0}</span> {t('users have started this section.')}</li>
            </ul>
        </div>
        <h2 class="text-xl font-semibold mb-6">{t('Section Progress')}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 class="font-semibold mb-2">{t('HTML Section')}</h3>
                <canvas bind:this={htmlChart}></canvas>
            </div>
            <div>
                <h3 class="font-semibold mb-2">{t('CSS Section')}</h3>
                <canvas bind:this={cssChart}></canvas>
            </div>
            <div>
                <h3 class="font-semibold mb-2">{t('JS Section')}</h3>
                <canvas bind:this={jsChart}></canvas>
            </div>
            <div>
                <h3 class="font-semibold mb-2">{t('Advanced JS Section')}</h3>
                <canvas bind:this={advJsChart}></canvas>
            </div>
        </div>
    </div>
</div>
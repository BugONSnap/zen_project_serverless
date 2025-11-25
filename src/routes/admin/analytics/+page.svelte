<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import Chart from 'chart.js/auto';
    import { cubicOut } from 'svelte/easing';

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

    // Animation for numbers
    function animateNumber(node: HTMLElement, { duration = 1000, delay = 0, from = 0, to = 0 }) {
        const start = Date.now();
        const end = start + duration;
        
        function update() {
            const now = Date.now();
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const easedProgress = cubicOut(progress);
            const value = Math.floor(from + (to - from) * easedProgress);
            
            node.textContent = value.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        const timeout = setTimeout(() => {
            update();
        }, delay);
        
        return {
            destroy() {
                clearTimeout(timeout);
            }
        };
    }

    onMount(() => {
        // Clean up old chart instances to prevent memory leaks
        htmlChartInstance?.destroy();
        cssChartInstance?.destroy();
        jsChartInstance?.destroy();
        advJsChartInstance?.destroy();

        if (htmlChart && cssChart && jsChart && advJsChart && data && data.sectionCounts) {
            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        titleFont: { size: 14, weight: '600' },
                        bodyFont: { size: 13 },
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (context: any) => {
                                return `${context.parsed.y} users`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)',
                            font: { size: 11 }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 12, weight: '500' }
                        }
                    }
                }
            };

            // HTML Chart
            htmlChartInstance = new Chart(htmlChart, {
                type: 'bar',
                data: {
                    labels: ['HTML'],
                    datasets: [{
                        label: 'Users Started HTML',
                        data: [data.sectionCounts['HTML'] ?? 0],
                        backgroundColor: '#f87171',
                        borderRadius: 6,
                        borderSkipped: false,
                        maxBarThickness: 80
                    }]
                },
                options: chartOptions
            });

            // CSS Chart
            cssChartInstance = new Chart(cssChart, {
                type: 'bar',
                data: {
                    labels: ['CSS'],
                    datasets: [{
                        label: 'Users Started CSS',
                        data: [data.sectionCounts['CSS'] ?? 0],
                        backgroundColor: '#60a5fa',
                        borderRadius: 6,
                        borderSkipped: false,
                        maxBarThickness: 80
                    }]
                },
                options: chartOptions
            });

            // JS Chart
            jsChartInstance = new Chart(jsChart, {
                type: 'bar',
                data: {
                    labels: ['JavaScript'],
                    datasets: [{
                        label: 'Users Started JavaScript',
                        data: [data.sectionCounts['JS'] ?? 0],
                        backgroundColor: '#facc15',
                        borderRadius: 6,
                        borderSkipped: false,
                        maxBarThickness: 80
                    }]
                },
                options: chartOptions
            });

            // Advanced JS Chart
            advJsChartInstance = new Chart(advJsChart, {
                type: 'bar',
                data: {
                    labels: ['Advanced JS'],
                    datasets: [{
                        label: 'Users Started Advanced JavaScript',
                        data: [data.sectionCounts['Advanced JS'] ?? 0],
                        backgroundColor: '#34d399',
                        borderRadius: 6,
                        borderSkipped: false,
                        maxBarThickness: 80
                    }]
                },
                options: chartOptions
            });
        }
    });
</script>

<div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-10 px-4 sm:px-6 lg:px-8 rounded-[20px]">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12" in:fly={{ y: -20, duration: 400 }}>
            <h1 class="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p class="text-gray-400">Track and analyze user progress and engagement</p>
        </div>

        <!-- Error Message -->
        {#if data.error}
            <div class="bg-red-900/50 border border-red-700 text-red-100 p-4 rounded-xl mb-8 text-center font-medium backdrop-blur-sm" in:fade>
                {data.error}
            </div>
        {/if}

        <!-- Metrics Explanation -->
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-10">
            <h2 class="text-2xl font-bold text-white mb-4 flex items-center">
                <svg class="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('Understanding the Metrics')}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium text-blue-400 mb-3">📊 {t('User Counts')}</h3>
                    <ul class="space-y-3 text-sm text-gray-300">
                        <li class="flex items-start">
                            <span class="inline-block bg-blue-500/20 text-blue-400 rounded-full p-1 mr-2">👥</span>
                            <div>
                                <span class="font-medium">{t('Total Users:')}</span> {t('All registered users on the platform (')}<span class="text-white">{data.totalUsers}</span>{t(')')}
                            </div>
                        </li>
                        <li class="flex items-start">
                            <span class="inline-block bg-green-500/20 text-green-400 rounded-full p-1 mr-2">✅</span>
                            <div>
                                <span class="font-medium">{t('Active Users:')}</span> {t('Users who have completed at least one lesson (')}<span class="text-white">{data.usersWithProgress}</span>{t(')')}
                            </div>
                        </li>
                        <li class="flex items-start">
                            <span class="inline-block bg-yellow-500/20 text-yellow-400 rounded-full p-1 mr-2">📚</span>
                            <div>
                                <span class="font-medium">{t('Section Participants:')}</span> {t('Users who have started specific learning paths')}
                            </div>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium text-green-400 mb-3">📈 {t('Engagement Metrics')}</h3>
                    <div class="bg-black/20 p-4 rounded-lg mb-3">
                        <div class="font-mono text-sm text-green-300 mb-2">
                            ({t('Active Users')} ÷ {t('Total Users')}) × 100 = <span class="text-white font-bold">{data.totalUsers > 0 ? Math.round((data.usersWithProgress / data.totalUsers) * 100) : 0}%</span>
                        </div>
                        <p class="text-xs text-gray-400 mb-3">
                            {t('Engagement Rate shows the percentage of your total user base that is actively learning.')}
                        </p>
                        <div class="space-y-2 text-sm">
                            <div class="flex items-center">
                                <div class="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                <span class="text-gray-300">
                                    {t('Good:')} <span class="text-white">30-50%</span> {t('of total users')}
                                </span>
                            </div>
                            <div class="flex items-center">
                                <div class="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                                <span class="text-gray-300">
                                    {t('Average:')} <span class="text-white">15-30%</span> {t('of total users')}
                                </span>
                            </div>
                            <div class="flex items-center">
                                <div class="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                <span class="text-gray-300">
                                    {t('Needs Improvement:')} <span class="text-white">&lt;15%</span> {t('of total users')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <!-- Total Users -->
            <div 
                class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-400/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-blue-500/10"
                in:fly={{ y: 20, delay: 100, duration: 400 }}
            >
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-400">Total Users</p>
                        <p class="mt-1 text-3xl font-bold text-white">
                            <span use:animateNumber={{ to: data.totalUsers, duration: 1500 }}>0</span>
                        </p>
                        <p class="mt-2 text-xs text-gray-400">Registered on platform</p>
                    </div>
                    <div class="p-3 rounded-full bg-blue-500/10">
                        <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Active Users -->
            <div 
                class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-green-400/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-green-500/10"
                in:fly={{ y: 20, delay: 200, duration: 400 }}
            >
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-400">Active Users</p>
                        <p class="mt-1 text-3xl font-bold text-white">
                            <span use:animateNumber={{ to: data.usersWithProgress, duration: 1500 }}>0</span>
                        </p>
                        <p class="mt-2 text-xs text-gray-400">Started making progress</p>
                    </div>
                    <div class="p-3 rounded-full bg-green-500/10">
                        <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Completion Rate -->
            <div 
                class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-yellow-400/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-yellow-500/10"
                in:fly={{ y: 20, delay: 300, duration: 400 }}
            >
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-400">Engagement</p>
                        <p class="mt-1 text-3xl font-bold text-white">
                            {data.totalUsers > 0 ? Math.round((data.usersWithProgress / data.totalUsers) * 100) : 0}%
                        </p>
                        <p class="mt-2 text-xs text-gray-400">Of users are active</p>
                    </div>
                    <div class="p-3 rounded-full bg-yellow-500/10">
                        <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Average Progress -->
            <div 
                class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-purple-500/10"
                in:fly={{ y: 20, delay: 400, duration: 400 }}
            >
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-400">Sections</p>
                        <p class="mt-1 text-3xl font-bold text-white">4</p>
                        <p class="mt-2 text-xs text-gray-400">Learning paths available</p>
                    </div>
                    <div class="p-3 rounded-full bg-purple-500/10">
                        <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section Progress -->
        <div class="mb-10">
            <h2 class="text-2xl font-bold text-white mb-6 flex items-center">
                <svg class="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Section Progress
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- HTML Section -->
                <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-red-400/30 transition-all duration-300 hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-red-400">HTML</h3>
                        <span class="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded-full">
                            {data.sectionCounts['HTML'] ?? 0} users
                        </span>
                    </div>
                    <div class="h-48">
                        <canvas bind:this={htmlChart}></canvas>
                    </div>
                    <p class="mt-4 text-sm text-gray-400 text-center">
                        {t('This shows how many users have started learning HTML. A higher bar indicates more engagement with HTML content.')}
                    </p>
                </div>

                <!-- CSS Section -->
                <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-400/30 transition-all duration-300 hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-blue-400">CSS</h3>
                        <span class="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full">
                            {data.sectionCounts['CSS'] ?? 0} users
                        </span>
                    </div>
                    <div class="h-48">
                        <canvas bind:this={cssChart}></canvas>
                    </div>
                    <p class="mt-4 text-sm text-gray-400 text-center">
                        {t('This chart displays the number of users who have begun the CSS learning path. Compare this with other sections to see relative popularity.')}
                    </p>
                </div>

                <!-- JavaScript Section -->
                <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-yellow-400/30 transition-all duration-300 hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-yellow-400">JavaScript</h3>
                        <span class="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full">
                            {data.sectionCounts['JS'] ?? 0} users
                        </span>
                    </div>
                    <div class="h-48">
                        <canvas bind:this={jsChart}></canvas>
                    </div>
                    <p class="mt-4 text-sm text-gray-400 text-center">
                        {t('JavaScript fundamentals engagement. This tracks initial interest in core JavaScript concepts.')}
                    </p>
                </div>

                <!-- Advanced JS Section -->
                <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-green-400/30 transition-all duration-300 hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-green-400">Advanced JS</h3>
                        <span class="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full">
                            {data.sectionCounts['Advanced JS'] ?? 0} users
                        </span>
                    </div>
                    <div class="h-48">
                        <canvas bind:this={advJsChart}></canvas>
                    </div>
                    <p class="mt-4 text-sm text-gray-400 text-center">
                        {t('Advanced JavaScript engagement. This shows users who have progressed to more complex JavaScript topics.')}
                    </p>
                </div>
            </div>
        </div>

        <!-- User Distribution -->
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-10">
            <h2 class="text-2xl font-bold text-white mb-6 flex items-center">
                <svg class="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                User Distribution
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium text-gray-300 mb-4">Section Engagement</h3>
                    <ul class="space-y-3">
                        <li class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                <span class="text-sm text-gray-300">HTML Section</span>
                            </div>
                            <span class="text-sm font-medium text-white">{data.sectionCounts['HTML'] ?? 0}</span>
                        </li>
                        <li class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                <span class="text-sm text-gray-300">CSS Section</span>
                            </div>
                            <span class="text-sm font-medium text-white">{data.sectionCounts['CSS'] ?? 0}</span>
                        </li>
                        <li class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                <span class="text-sm text-gray-300">JavaScript Section</span>
                            </div>
                            <span class="text-sm font-medium text-white">{data.sectionCounts['JS'] ?? 0}</span>
                        </li>
                        <li class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <span class="text-sm text-gray-300">Advanced JS Section</span>
                            </div>
                            <span class="text-sm font-medium text-white">{data.sectionCounts['Advanced JS'] ?? 0}</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-medium text-gray-300 mb-4">Quick Stats</h3>
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between text-sm text-gray-400 mb-1">
                                <span>Active Users</span>
                                <span>{data.usersWithProgress} / {data.totalUsers}</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                    class="bg-blue-500 h-2 rounded-full" 
                                    style={`width: ${data.totalUsers > 0 ? (data.usersWithProgress / data.totalUsers) * 100 : 0}%`}>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between text-sm text-gray-400 mb-1">
                                <span>Engagement Rate</span>
                                <span>{data.totalUsers > 0 ? Math.round((data.usersWithProgress / data.totalUsers) * 100) : 0}%</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                    class="bg-green-500 h-2 rounded-full" 
                                    style={`width: ${data.totalUsers > 0 ? (data.usersWithProgress / data.totalUsers) * 100 : 0}%`}>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
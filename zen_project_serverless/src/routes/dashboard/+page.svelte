<script lang="ts">
    import type { PageData } from './$types';
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    import { goto } from '$app/navigation';

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
</script>

<div class="min-h-screen bg-cover bg-center overflow-y-auto" style="background-image: url('/BG.jpg');">
    <!-- Header -->
    <DashboardHeader user={data.user} />

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Quick Actions -->
        <div class="mt-8 mb-8">
            <div class="bg-white shadow rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                </div>
                <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <button class="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300" on:click={() => goto('/css')}>
                            <img src="/CSS.png" alt="CSS Logo" class="h-8 w-8 object-contain mr-2">
                            CSS
                        </button>
                        <button class="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300" on:click={() => goto('/html')}>
                            <img src="/HTML.png" alt="HTML Logo" class="h-8 w-8 object-contain mr-2">
                            HTML
                        </button>
                        <button class="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300" on:click={() => goto('/javascript')}>
                            <img src="/JS.webp" alt="JS Logo" class="h-8 w-8 object-contain mr-2">
                            JavaScript
                        </button>
                        <button class="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300" on:click={() => goto('/advancejs')}>
                            <img src="/JS.webp" alt="Advanced JS Logo" class="h-8 w-8 object-contain mr-2">
                            Advanced JavaScript
                        </button>
                        <button class="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-green-200 hover:bg-green-300" on:click={() => goto('/playground')}>
                            <span class="text-2xl mr-2">🚀</span>
                            Code Playground
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
            {#each stats as stat}
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="p-5">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <span class="text-3xl">{stat.icon}</span>
                            </div>
                            <div class="ml-5 w-0 flex-1">
                                <dl>
                                    <dt class="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                                    <dd class="text-lg font-semibold text-gray-900">{stat.value}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <!-- Category Progress -->
        <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Category Progress</h3>
            </div>
            <div class="border-t border-gray-200">
                <ul role="list" class="divide-y divide-gray-200">
                    {#each categories as category}
                        <li class="px-4 py-4 sm:px-6">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="ml-3">
                                        <p class="text-sm font-medium text-gray-900">{category.name}</p>
                                        <p class="text-sm text-gray-500">
                                            {category.completed} of {category.total} quizzes completed
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    <span class="text-sm text-gray-500">{category.progress}%</span>
                                </div>
                            </div>
                            <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-600 h-2 rounded-full" style="width: {category.progress}%"></div>
                            </div>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    </main>
</div>
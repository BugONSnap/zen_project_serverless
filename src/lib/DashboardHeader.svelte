<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    // Correct Svelte prop declarations
    export let title: string = 'Zentry';
    export let user: { id: number; username: string; email: string } | undefined;
    export let isPlaygroundPage: boolean = false;

    let menuOpen = false;
    let menuRef: HTMLDivElement | null = null;

    let headerStyle = '';

    $: headerClasses = !isPlaygroundPage
        ? 'bg-[#6F1414] text-white shadow-lg'
        : 'bg-white text-gray-900';


    async function handleLogout() {
        try {
            // Call the logout API endpoint to clear all cookies server-side
            await fetch('/api/logout', { method: 'POST' });
            // Redirect to main page
            goto('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    // Function to navigate back to the dashboard
    function goBackToDashboard() {
        goto('/dashboard');
    }

    function handleMenuToggle() {
        menuOpen = !menuOpen;
    }

    function handleMenuClose() {
        menuOpen = false;
    }

    // Close dropdown when clicking outside
    onMount(() => {
        function handleClick(event: MouseEvent) {
            if (menuRef && !menuRef.contains(event.target as Node)) {
                menuOpen = false;
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    });
</script>

<header class={`shadow sticky top-0 z-50 transition-colors duration-300 ${headerClasses}`}>
    <div class="max-w-7xl mx-auto py-2 px-2 sm:px-4 lg:px-8 flex justify-between items-center">
        <div class="flex items-center space-x-2">
    <img src="/zentry%20logo.png" alt="Zentry Logo" class="h-10 w-auto" />
    <h1 class="text-3xl font-bold text-white">{title}</h1>
</div>
        <!-- Desktop nav -->
        <div class="hidden md:flex items-center space-x-4">
            {#if $page.url.pathname !== '/dashboard'}
                <button
                    class="text-white text-sm font-medium hover:underline focus:outline-none"
                    on:click={goBackToDashboard}
                >
                    Dashboard
                </button>   
            {/if}
            {#if $page.url.pathname !== '/playground'}
            <a href="/playground" class="text-white text-sm font-medium hover:underline flex items-center space-x-2 focus:outline-none" title="Code Playground">
                     Playground
                </a>
            {/if}
            <a href="/learn" class="text-white text-sm font-medium hover:underline focus:outline-none" title="Learn">
                Learn
            </a>
            <a href="/leaderboard" class="text-white text-sm font-medium hover:underline focus:outline-none" title="Leaderboard">
                Leaderboard
            </a>
            <!-- Profile avatar -->
         
            <button
                class="text-white text-sm font-medium hover:underline focus:outline-none"
                on:click={handleLogout}
            >
                Logout
            </button>
            <a href="/profile" title="Profile">
                <div class="w-10 h-10 rounded-full bg-white-500 flex items-center underline justify-center text-lg font-bold text-Black hover:bg-white-600 transition">
                    {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
            </a>
        </div>
        <!-- Mobile/Tablet nav -->
        <div class="md:hidden relative" bind:this={menuRef}>
            <button
                class="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                on:click={() => { menuOpen = !menuOpen; }}
                aria-label="Open menu"
            >
                <svg class="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            {#if menuOpen}
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-2 border">
                    {#if $page.url.pathname !== '/dashboard'}
                        <button
                            class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-indigo-100"
                            on:click={() => { goBackToDashboard(); menuOpen = false; }}
                        >
                            Back to Dashboard
                        </button>
                    {/if}
                    {#if $page.url.pathname !== '/playground'}
                        <a href="/playground" title="Code Playground" class="block px-4 py-2 text-sm text-white hover:bg-green-100" on:click={() => { menuOpen = false; }}>
                            🚀 Playground
                        </a>
                    {/if}
                    {#if $page.url.pathname !== '/learn'}
                        <a href="/learn" title="Learn" class="block px-4 py-2 text-sm text-white hover:bg-green-100" on:click={() => { menuOpen = false; }}>
                            Learn
                        </a>
                    {/if}
                    {#if $page.url.pathname !== '/leaderboard'}
                        <a href="/leaderboard" title="Leaderboard" class="block px-4 py-2 text-sm text-white hover:bg-green-100" on:click={() => { menuOpen = false; }}>
                            Leaderboard
                        </a>
                    {/if}
                    {#if $page.url.pathname !== '/profile'}
                        <a href="/profile" title="Profile" class="block px-4 py-2 text-sm text-white hover:bg-indigo-100" on:click={() => { menuOpen = false; }}>
                            Profile
                        </a>
                    {/if}
                    <button
                        class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                        on:click={() => { handleLogout(); menuOpen = false; }}
                    >
                        Logout
                    </button>
                </div>
            {/if}
        </div>
    </div>
</header> 
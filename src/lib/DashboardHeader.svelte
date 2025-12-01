<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    // Correct Svelte prop declarations
    export let title: string = 'Zentry';
    export let user: { id: number; username: string; email: string } | undefined;
    export let isPlaygroundPage: boolean = false;
    export let quizCategory: string | undefined = undefined;
    export let pageName: string | undefined = undefined;

    let menuOpen = false;
    let menuRef: HTMLDivElement | null = null;

    let headerStyle = '';

    $: headerClasses = !isPlaygroundPage
        ? 'text-white shadow-lg gradient-header'
        : 'bg-white text-gray-900';

    // Determine learning subject based on current page pathname
    $: learningSubject = (() => {
        const pathname = $page.url.pathname;
        if (pathname === '/learn/css') return 'CSS';
        if (pathname === '/learn/javascript-learn') return 'JavaScript';
        if (pathname === '/learn/advance-javascript') return 'Advanced JS';
        if (pathname === '/learn') return 'HTML';
        return null;
    })();


    async function handleLogout() {
        try {
            // Call the logout API endpoint to clear all cookies server-side
            await fetch('/api/logout', { method: 'POST' });
            // Redirect to main page
            goto('/landing');
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

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Poppins:wght@700&display=swap');

.header-title {
    font-family: 'Poppins', Arial, sans-serif;
    font-weight: 700;
    color: white;
    /* Responsive font sizing with clamping - scales with viewport but max at 1.4rem */
    font-size: clamp(1rem, 3vw, 1.4rem);
}

/* Additional media queries for fine-tuning on specific breakpoints */
@media (max-width: 640px) {
    .header-title {
        font-size: 1.1rem;
    }
}

@media (max-width: 480px) {
    .header-title {
        font-size: 0.95rem;
    }
}
.header-support {
    font-family: 'Poppins', Arial, sans-serif;
    font-size: 1.1rem;
    font-weight: 400;
}
.gradient-header {
    background: linear-gradient(to right, #1a1f2e 0%, #111827 50%, #0f172a 100%);
    border-bottom: 1px solid rgba(217, 119, 6, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
.nav-link {
    color: white;
    transition: all 0.3s ease;
}
.nav-link:hover {
    color: #d97706;
    text-decoration: underline;
}
.profile-avatar {
    background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.125rem;
    box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
    transition: all 0.3s ease;
    border: 2px solid rgba(217, 119, 6, 0.3);
}
.profile-avatar:hover {
    box-shadow: 0 6px 16px rgba(217, 119, 6, 0.5);
    border-color: rgba(217, 119, 6, 0.6);
    transform: scale(1.05);
}
.mobile-menu {
    background: rgba(17, 24, 39, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(217, 119, 6, 0.2);
    border-radius: 0.5rem;
}
.mobile-menu-item {
    color: white;
    transition: all 0.2s ease;
}
.mobile-menu-item:hover {
    background: rgba(217, 119, 6, 0.1);
    color: #d97706;
}
.hamburger-icon {
    color: white;
    transition: color 0.3s ease;
}
.hamburger-icon:hover {
    color: #d97706;
}
</style>

<header class={`shadow sticky top-0 z-50 transition-colors duration-300 ${headerClasses}`} style="position: sticky; top: 0; z-index: 1000; font-family: poppins;">
    <div class="max-w-7xl mx-auto py-3 px-2 sm:px-4 lg:px-8 flex justify-between items-center">
        <div class="flex items-center space-x-3">
            <img src="/server-logo.png" alt="Zentry Logo" class="h-10 w-auto hidden md:block" />
            {#if quizCategory}
                <span class="text-amber-400 font-bold" style="font-size: 2rem;">{quizCategory}</span>
            {:else if pageName}
                <span class="text-amber-400 font-bold" style="font-size: 2rem;">
                    {pageName}
                    {#if pageName === 'Learn' && learningSubject}
                        <span class="text-amber-300"> - {learningSubject}</span>
                    {/if}
                </span>
            {/if}
        </div>
        <!-- Desktop nav -->
        <div class="hidden md:flex items-center space-x-6">
            {#if !user}
                <a href="/landing" class="nav-link text-sm font-semibold focus:outline-none" title="Home">
                    Home
                </a>
            {/if}
            {#if user}
                {#if $page.url.pathname !== '/dashboard'}
                    <button
                        class="nav-link text-sm font-semibold focus:outline-none"
                        on:click={goBackToDashboard}
                    >
                        Dashboard
                    </button>   
                {/if}
                {#if $page.url.pathname !== '/playground'}
                    <a href="/playground" class="nav-link text-sm font-semibold flex items-center space-x-2 focus:outline-none" title="Code Playground">
                        Playground
                    </a>
                {/if}
            {/if}
            {#if $page.url.pathname !== '/learn' && !$page.url.pathname.startsWith('/learn/')}
                <a href="/learn" class="nav-link text-sm font-semibold focus:outline-none" title="Learn">
                    Learn
                </a>
            {:else if $page.url.pathname.startsWith('/learn')}
                <a href="/learn" class="nav-link text-sm font-semibold focus:outline-none" title="Learn">
                    Learn
                </a>
            {/if}
            <a href="/leaderboard" class="nav-link text-sm font-semibold focus:outline-none" title="Leaderboard">
                Leaderboard
            </a>
            <a href="/community" class="nav-link text-sm font-semibold focus:outline-none" title="Community">
                Community
            </a>
            {#if user}
                <button
                    class="nav-link text-sm font-semibold focus:outline-none"
                    on:click={handleLogout}
                >
                    Logout
                </button>
                {#if user.username}
                    <a href="/profile" title="Profile">
                        <div class="profile-avatar">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    </a>
                {/if}
            {:else}
                <a href="/login" class="nav-link text-sm font-semibold focus:outline-none">Login</a>
            {/if}
        </div>
        <!-- Mobile/Tablet nav -->
        <div class="md:hidden relative" bind:this={menuRef}>
            <button
                class="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                on:click={() => { menuOpen = !menuOpen; }}
                aria-label="Open menu"
            >
                <svg class="h-6 w-6 hamburger-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            {#if menuOpen}
                <div class="absolute right-0 mt-2 w-56 mobile-menu z-50 py-2">
                    {#if !user}
                        <a href="/landing" title="Home" class="mobile-menu-item block px-4 py-3 text-sm font-semibold" on:click={() => { menuOpen = false; }}>
                            Home
                        </a>
                    {/if}
                    {#if user}
                        {#if $page.url.pathname !== '/dashboard'}
                            <button
                                class="mobile-menu-item block w-full text-left px-4 py-3 text-sm font-semibold"
                                on:click={() => { goBackToDashboard(); menuOpen = false; }}
                            >
                                Back to Dashboard
                            </button>
                        {/if}
                        {#if $page.url.pathname !== '/playground'}
                            <a href="/playground" title="Code Playground" class="mobile-menu-item block px-4 py-3 text-sm font-semibold" on:click={() => { menuOpen = false; }}>
                                Playground
                            </a>
                        {/if}
                    {/if}
                    {#if $page.url.pathname !== '/learn' && !$page.url.pathname.startsWith('/learn/')}
                        <a href="/learn" title="Learn" class="mobile-menu-item block px-4 py-3 text-sm font-semibold" on:click={() => { menuOpen = false; }}>
                            Learn
                        </a>
                    {:else if $page.url.pathname.startsWith('/learn')}
                        <a href="/learn" title="Learn" class="mobile-menu-item block px-4 py-3 text-sm font-semibold" on:click={() => { menuOpen = false; }}>
                            Learn
                        </a>
                    {/if}
                    {#if $page.url.pathname !== '/leaderboard'}
                        <a href="/leaderboard" title="Leaderboard" class="mobile-menu-item block px-4 py-3 text-sm font-semibold" on:click={() => { menuOpen = false; }}>
                            Leaderboard
                        </a>
                    {/if}
                    <a href="/community" title="Community" class="mobile-menu-item block px-4 py-3 text-sm font-semibold" on:click={() => { menuOpen = false; }}>
                        Community
                    </a>
                    {#if user}
                        {#if $page.url.pathname !== '/profile'}
                            <a href="/profile" title="Profile" class="mobile-menu-item block px-4 py-3 text-sm font-semibold" on:click={() => { menuOpen = false; }}>
                                Profile
                            </a>
                        {/if}
                        <button
                            class="mobile-menu-item block w-full text-left px-4 py-3 text-sm font-semibold"
                            on:click={() => { handleLogout(); menuOpen = false; }}
                        >
                            Logout
                        </button>
                    {:else}
                        <a href="/landing" class="mobile-menu-item block px-4 py-3 text-sm font-semibold" on:click={() => { menuOpen = false; }}>
                            Login
                        </a>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</header>
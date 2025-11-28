<script lang="ts">
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    // Simulate user state (replace with real session/user logic)
    let user = undefined; // Not logged in

    // Handler for protected navigation
    function handleProtectedNav(path: string) {
        if (!user) {
            goto('/'); // Redirect to login (root is login)
        } else {
            goto(path);
        }
    }
</script>

<DashboardHeader {user} pageName="Landing" />

<div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white">
    <div class="mt-24 text-center">
        <h1 class="text-5xl font-bold mb-4">Welcome to ZenTry! Please wait for more updates Thank youuu</h1>
        <p class="text-lg mb-8">Your journey to mastering web development starts here.</p>
        <div class="flex flex-col gap-4 items-center">
            <button
                class="px-8 py-3 rounded-lg bg-[#d97706] text-white font-semibold text-lg shadow-lg hover:bg-[#f59e0b] transition disabled:opacity-50"
                on:click={() => handleProtectedNav('/dashboard')}
                disabled={!user}
            >
                Go to Dashboard
            </button>
            <button
                class="px-8 py-3 rounded-lg bg-[#1e40af] text-white font-semibold text-lg shadow-lg hover:bg-[#2563eb] transition disabled:opacity-50"
                on:click={() => handleProtectedNav('/playground')}
                disabled={!user}
            >
                Try the Playground
            </button>
            <a
                href="/learn"
                class="px-8 py-3 rounded-lg bg-[#059669] text-white font-semibold text-lg shadow-lg hover:bg-[#10b981] transition"
            >
                Explore Learn
            </a>
        </div>
        {#if !user}
            <div class="mt-8 text-sm text-gray-300">
                <span>Already have an account? <a href="/login" class="text-[#d97706] underline">Login</a></span>
            </div>
        {/if}
    </div>
</div>
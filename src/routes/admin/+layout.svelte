<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    let { data, children }: { data: LayoutData, children: Snippet } = $props();

    const navItems = [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/quizzes', label: 'Quizzes' },
        { href: '/admin/categories', label: 'Categories' },
        { href: '/admin/challengeTypes', label: 'Challenge Types' },
        { href: '/admin/progress', label: 'User Progress' },
        { href: '/admin/rankings', label: 'Rankings' },
        { href: '/admin/results', label: 'Quiz Results' }
    ];

    async function handleLogout() {
        try {
            // Clear the admin cookie
            document.cookie = 'isAdmin=false; path=/; max-age=0';
            
            // Redirect to main page
            goto('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
</script>

<div class="admin-layout">
    <aside class="sidebar">
        <div class="sidebar-header">
            <h2>Admin Panel</h2>
        </div>
        <nav class="sidebar-nav">
            <ul>
                {#each navItems as item}
                    <li>
                        <a 
                            href={item.href} 
                            class="sidebar-link" 
                            class:active={$page.url.pathname === item.href}
                        >
                            {item.label}
                        </a>
                    </li>
                {/each}
            </ul>
        </nav>
        <div class="sidebar-footer">
            <button class="logout-button" on:click={handleLogout}>
                Logout
            </button>
        </div>
    </aside>
    <main class="content">
        {@render children()}
    </main>
</div>

<style>
    .admin-layout {
        display: flex;
        min-height: 100vh;
    }

    .sidebar {
        width: 250px;
        background-color: #1a1a1a;
        color: white;
        padding: 1rem;
        flex-shrink: 0;
    }

    .sidebar-header {
        padding: 1rem 0;
        border-bottom: 1px solid #333;
        margin-bottom: 1rem;
    }

    .sidebar-header h2 {
        margin: 0;
        font-size: 1.5rem;
        text-align: center;
    }

    .sidebar-nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .sidebar-nav li {
        margin-bottom: 0.5rem;
    }

    .sidebar-link {
        color: #fff;
        text-decoration: none;
        padding: 0.75rem 1rem;
        display: block;
        border-radius: 4px;
        transition: background-color 0.2s, color 0.2s;
    }

    .sidebar-link:hover {
        background-color: #333;
    }

    .sidebar-link.active {
        background-color: #007bff;
        color: white;
    }

    .content {
        flex-grow: 1;
        padding: 2rem;
        background-color: #f5f5f5;
        overflow-y: auto; /* Add scrolling if content overflows */
    }

    .sidebar-footer {
        margin-top: auto;
        padding: 1rem 0;
        border-top: 1px solid #333;
    }

    .logout-button {
        width: 100%;
        padding: 0.75rem 1rem;
        background-color: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .logout-button:hover {
        background-color: #c82333;
    }
</style>
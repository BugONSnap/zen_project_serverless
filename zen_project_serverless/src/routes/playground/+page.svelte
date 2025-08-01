<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import CodeEditor from '$lib/components/CodeEditor.svelte';
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    // import Preview from '$lib/components/Preview.svelte'; // Removed direct import
    // import Console from '$lib/components/Console.svelte'; // Removed direct import
    import { enhance } from '$app/forms';
    import { browser } from '$app/environment'; // Import browser environment flag

    export let data; // Declare data prop to receive server-side data

    // Dynamically import Preview component
    let Preview: any;
    onMount(async () => {
        if (browser) {
            const module = await import('$lib/components/Preview.svelte');
            Preview = module.default;
        }
    });

    // Code stores (for editors) - Fixed HTML structure
    const htmlCode = writable(`<h1>Welcome to the Playground!</h1>
<p>Start coding and see the results in real-time.</p>
<div id="output"></div>`);

    const cssCode = writable(`body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}

p {
    color: #666;
    line-height: 1.6;
}

#output {
    margin-top: 20px;
    padding: 15px;
    background: white;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}`);

    const jsCode = writable(`// Your JavaScript code here
console.log('Hello from the playground!');

// Example: Add some interactive elements
document.addEventListener('DOMContentLoaded', function() {
    const output = document.getElementById('output');
    if (output) {
        output.innerHTML = '<h3>JavaScript is working!</h3><p>Try modifying this code and see the changes.</p>';
    }
});`);

    // Stores for rendering in the iframe (updated on 'Run' click)
    const renderedHtmlCode = writable('');
    const renderedCssCode = writable('');
    const renderedJsCode = writable('');

    onMount(() => {
        runCode(); // Run code initially after component mounts
    });

    // Active tab
    let activeTab = 'html';
    let isFullscreen = false;

    function runCode() {
        renderedHtmlCode.set($htmlCode);
        renderedCssCode.set($cssCode);
        renderedJsCode.set($jsCode);
    }

    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
    }

    function resetCode() {
        htmlCode.set(`<h1>Welcome to the Playground!</h1>
<p>Start coding and see the results in real-time.</p>
<div id="output"></div>`);
        
        cssCode.set(`body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}

p {
    color: #666;
    line-height: 1.6;
}

#output {
    margin-top: 20px;
    padding: 15px;
    background: white;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}`);

        jsCode.set(`// Your JavaScript code here
console.log('Hello from the playground!');

// Example: Add some interactive elements
document.addEventListener('DOMContentLoaded', function() {
    const output = document.getElementById('output');
    if (output) {
        output.innerHTML = '<h3>JavaScript is working!</h3><p>Try modifying this code and see the changes.</p>';
    }
});`);

        // Reset rendered code as well
        runCode();
    }
</script>

<svelte:head>
    <title>Code Playground - Zen Project</title>
    <meta name="description" content="Interactive code playground for HTML, CSS, and JavaScript" />
</svelte:head>

<div class="h-screen flex flex-col bg-gray-900 text-white" class:fixed={isFullscreen} class:inset-0={isFullscreen} class:z-50={isFullscreen}>
    <!-- Header -->
    <DashboardHeader user={data.user || undefined} isPlaygroundPage={true} />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        <!-- Code Editors Section -->
        <div class="w-full lg:w-1/2 flex flex-col border-r border-gray-700 flex-grow min-h-0">
            <!-- Editor Tabs -->
            <div class="bg-gray-800 border-b border-gray-700 flex">
                <button 
                    class="flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    class:bg-green-600={activeTab === 'html'}
                    class:text-white={activeTab === 'html'}
                    class:bg-gray-700={activeTab !== 'html'}
                    class:text-gray-300={activeTab !== 'html'}
                    class:hover:bg-gray-600={activeTab !== 'html'}
                    on:click={() => activeTab = 'html'}
                >
                    <span>📄</span>
                    <span>HTML</span>
                </button>
                <button 
                    class="flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    class:bg-green-600={activeTab === 'css'}
                    class:text-white={activeTab === 'css'}
                    class:bg-gray-700={activeTab !== 'css'}
                    class:text-gray-300={activeTab !== 'css'}
                    class:hover:bg-gray-600={activeTab !== 'css'}
                    on:click={() => activeTab = 'css'}
                >
                    <span>🎨</span>
                    <span>CSS</span>
                </button>
                <button 
                    class="flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    class:bg-green-600={activeTab === 'js'}
                    class:text-white={activeTab === 'js'}
                    class:bg-gray-700={activeTab !== 'js'}
                    class:text-gray-300={activeTab !== 'js'}
                    class:hover:bg-gray-600={activeTab !== 'js'}
                    on:click={() => activeTab = 'js'}
                >
                    <span>⚡</span>
                    <span>JavaScript</span>
                </button>
            </div>

            <!-- Editor Content -->
            <div class="flex-1 overflow-x-auto overflow-y-auto min-h-0 h-[50vh] lg:h-auto max-h-[50vh] lg:max-h-none">
                {#if activeTab === 'html'}
                    <CodeEditor 
                        language="html" 
                        bind:value={$htmlCode}
                        placeholder="Write your HTML here..."
                    />
                {:else if activeTab === 'css'}
                    <CodeEditor 
                        language="css" 
                        bind:value={$cssCode}
                        placeholder="Write your CSS here..."
                    />
                {:else if activeTab === 'js'}
                    <CodeEditor 
                        language="javascript" 
                        bind:value={$jsCode}
                        placeholder="Write your JavaScript here..."
                    />
                {/if}
            </div>
        </div>

        <!-- Preview Section -->
        <div class="w-full lg:w-1/2 flex flex-col bg-white flex-grow min-h-0">
            <div class="flex-1 overflow-x-auto overflow-y-auto min-h-0 h-[50vh] lg:h-auto max-h-[50vh] lg:max-h-none">
                {#if Preview}
                    <div class="flex justify-between items-center bg-gray-900 p-4 shadow-xl">
                        <div class="flex items-center space-x-4">
                            <span class="text-green-500 text-base font-bold flex items-center">
                                <span class="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>Preview Console Output
                            </span>
                        </div>
                        <button class="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-full shadow-lg hover:from-green-600 hover:to-green-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75" on:click={runCode}>
                            Run Code
                        </button>
                    </div>
                    <Preview htmlCode={$renderedHtmlCode} cssCode={$renderedCssCode} jsCode={$renderedJsCode} />
                {:else}
                    <div class="flex items-center justify-center h-full bg-gray-50">
                        <div class="text-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p class="text-gray-600">Loading playground...</p>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    .playground-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: #1a1a1a;
        color: #fff;
    }

    .playground-container.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
    }

    .playground-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background: #2d2d2d;
        border-bottom: 1px solid #444;
        flex-shrink: 0;
    }

    .header-left h1 {
        margin: 0;
        font-size: 1.5rem;
        color: #4CAF50;
    }

    .header-left p {
        margin: 0.25rem 0 0 0;
        color: #ccc;
        font-size: 0.9rem;
    }

    .header-controls {
        display: flex;
        gap: 0.5rem;
    }

    .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
        background: #4CAF50;
        color: white;
    }

    .btn:hover {
        background: #45a049;
        transform: translateY(-1px);
    }

    .btn-secondary {
        background: #666;
    }

    .btn-secondary:hover {
        background: #555;
    }

    @media (max-width: 768px) {
        .playground-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }
    }
</style> 
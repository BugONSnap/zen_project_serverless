<script lang="ts">
    export let logs: Array<{type: string, message: string, timestamp: string}> = [];
    export let isVisible: boolean = false;

    function clearLogs() {
        logs = [];
    }

    function getLogIcon(type: string) {
        switch (type.toLowerCase()) {
            case 'error': return '❌';
            case 'warn': return '⚠️';
            case 'info': return 'ℹ️';
            case 'log': 
            default: return '📝';
        }
    }

    function getLogColor(type: string) {
        switch (type.toLowerCase()) {
            case 'error': return 'text-red-400';
            case 'warn': return 'text-yellow-400';
            case 'info': return 'text-blue-400';
            case 'log': 
            default: return 'text-green-400';
        }
    }
</script>

{#if isVisible}
    <div class="border-t border-gray-200 bg-gray-900 text-gray-100">
        <!-- Console Header -->
        <div class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <h3 class="text-sm font-medium text-gray-300 flex items-center">
                <span class="mr-2">🖥️</span>
                Console Output
            </h3>
            <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-400">{logs.length} logs</span>
                <button 
                    class="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                    on:click={clearLogs}
                >
                    Clear
                </button>
            </div>
        </div>

        <!-- Console Content -->
        <div class="max-h-48 overflow-y-auto p-3">
            {#if logs.length === 0}
                <div class="text-center text-gray-500 text-sm py-8">
                    <span class="block text-2xl mb-2">🖥️</span>
                    No console output yet
                </div>
            {:else}
                <div class="space-y-1">
                    {#each logs as log}
                        <div class="flex items-start space-x-2 text-xs font-mono">
                            <span class="text-gray-500 flex-shrink-0">{log.timestamp}</span>
                            <span class="flex-shrink-0">{getLogIcon(log.type)}</span>
                            <span class="flex-shrink-0 text-gray-400">[{log.type.toUpperCase()}]</span>
                            <span class="flex-1 break-all {getLogColor(log.type)}">{log.message}</span>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
{/if} 
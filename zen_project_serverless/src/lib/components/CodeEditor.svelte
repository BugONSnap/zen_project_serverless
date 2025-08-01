<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { writable } from 'svelte/store';

    export let value: string = '';
    export let language: 'html' | 'css' | 'javascript' = 'html';
    export let placeholder: string = '';

    const dispatch = createEventDispatcher();
    let textarea: HTMLTextAreaElement;
    let lineNumbers: HTMLDivElement;
    let isFocused = false;

    // Auto-resize textarea - REMOVED, relying on flexbox and overflow
    // function autoResize() {
    //     if (textarea) {
    //         textarea.style.height = 'auto';
    //         textarea.style.height = textarea.scrollHeight + 'px';
    //         updateLineNumbers();
    //     }
    // }

    // Update line numbers
    function updateLineNumbers() {
        if (lineNumbers && textarea) {
            const lines = textarea.value.split('\n');
            lineNumbers.innerHTML = lines.map((_, i) => `<span class="block" style="line-height: 24px;">${i + 1}</span>`).join('');
            // Removed: Ensure line numbers div matches textarea scroll height (for initial load/content changes)
            // lineNumbers.style.height = textarea.scrollHeight + 'px';
        }
    }

    // Handle input changes
    function handleInput() {
        value = textarea.value;
        // autoResize(); // Removed
        updateLineNumbers(); // Keep updating line numbers
        dispatch('input', { value });
    }

    // Handle keydown for tab support
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Tab') {
            event.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            
            if (event.shiftKey) {
                // Remove tab/4 spaces
                const beforeCursor = textarea.value.substring(0, start);
                const afterCursor = textarea.value.substring(end);
                const lineStart = beforeCursor.lastIndexOf('\n') + 1;
                const line = textarea.value.substring(lineStart, start);
                
                if (line.startsWith('    ')) {
                    const newValue = beforeCursor.substring(0, lineStart) + 
                                   line.substring(4) + 
                                   afterCursor;
                    textarea.value = newValue;
                    textarea.selectionStart = textarea.selectionEnd = start - 4;
                }
            } else {
                // Add tab/4 spaces
                const newValue = textarea.value.substring(0, start) + 
                               '    ' + 
                               textarea.value.substring(end);
                textarea.value = newValue;
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            }
            
            handleInput();
        }
    }

    // Handle focus/blur
    function handleFocus() {
        isFocused = true;
    }

    function handleBlur() {
        isFocused = false;
    }

    // Scroll synchronization
    function handleScroll() {
        if (lineNumbers && textarea) {
            lineNumbers.scrollTop = textarea.scrollTop;
        }
    }

    onMount(() => {
        // autoResize(); // Removed
        updateLineNumbers();
        // Add scroll listener
        textarea.addEventListener('scroll', handleScroll);
        return () => {
            textarea.removeEventListener('scroll', handleScroll);
        };
    });

    // Watch for external value changes and trigger updates
    $: if (textarea && value !== textarea.value) {
        textarea.value = value;
        // autoResize(); // Removed
        updateLineNumbers();
    }
</script>

<div class="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden" class:ring-2={isFocused} class:ring-green-500={isFocused}>
    <!-- Editor Header -->
    <div class="px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
            {language.toUpperCase()}
        </span>
    </div>
    
    <!-- Editor Content -->
    <div class="flex-1 flex overflow-hidden relative">
        <!-- Line Numbers -->
        <div 
            bind:this={lineNumbers}
            class="w-12 bg-gray-800 text-gray-500 text-xs font-mono py-4 px-2 text-right border-r border-gray-700 select-none overflow-y-auto flex flex-col line-numbers-display"
            style="line-height: 24px;"
        ></div>
        
        <!-- Code Textarea -->
        <textarea
            bind:this={textarea}
            bind:value
            {placeholder}
            on:input={handleInput}
            on:keydown={handleKeydown}
            on:focus={handleFocus}
            on:blur={handleBlur}
            spellcheck="false"
            class="flex-1 bg-gray-900 text-gray-100 border-0 outline-none font-mono text-sm p-4 resize-none overflow-y-auto overflow-x-auto whitespace-pre tab-size-4 code-textarea-element"
            style="font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; line-height: 24px;"
        ></textarea>
    </div>
</div>

<style>
    /* Hide scrollbar for Code Textarea */
    .code-textarea-element::-webkit-scrollbar {
        display: none;
    }
    .code-textarea-element {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }

    /* Hide scrollbar for Line Numbers */
    .line-numbers-display::-webkit-scrollbar {
        display: none;
    }
    .line-numbers-display {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
</style> 
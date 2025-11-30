<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';

    type QuestionBlock = {
        question: string;
        answer: string;
        snippet?: string;
        note?: string;
        attributes?: { name: string; description: string; badge?: string }[];
        callouts?: { title: string; body: string; tone?: 'info' | 'warning' }[];
        bullets?: string[];
        references: { label: string; url: string }[];
    };

    type SearchResult = {
        lesson: QuestionBlock;
        category: string;
        categoryPath: string;
        matchField: string;
        matchText: string;
        lessonIndex: number; // Index of the lesson in the lessons array
    };

    export let allLessons: { category: string; path: string; lessons: QuestionBlock[] }[] = [];

    let searchQuery = '';
    let searchResults: SearchResult[] = [];
    let isSearching = false;
    let showResults = false;

    function searchLessons(query: string) {
        if (!query.trim()) {
            searchResults = [];
            showResults = false;
            return;
        }

        if (!allLessons || allLessons.length === 0) {
            searchResults = [];
            showResults = false;
            isSearching = false;
            return;
        }

        isSearching = true;
        const queryLower = query.toLowerCase().trim();
        const results: SearchResult[] = [];

        // Search through all lessons
        for (const categoryData of allLessons) {
            if (!categoryData || !categoryData.lessons) continue;
            for (let lessonIndex = 0; lessonIndex < categoryData.lessons.length; lessonIndex++) {
                const lesson = categoryData.lessons[lessonIndex];
                let matchField = '';
                let matchText = '';

                // Search in question
                if (lesson.question.toLowerCase().includes(queryLower)) {
                    matchField = 'question';
                    matchText = lesson.question;
                }
                // Search in answer
                else if (lesson.answer.toLowerCase().includes(queryLower)) {
                    matchField = 'answer';
                    matchText = lesson.answer.substring(0, 200) + (lesson.answer.length > 200 ? '...' : '');
                }
                // Search in snippet
                else if (lesson.snippet && lesson.snippet.toLowerCase().includes(queryLower)) {
                    matchField = 'snippet';
                    matchText = lesson.snippet;
                }
                // Search in note
                else if (lesson.note && lesson.note.toLowerCase().includes(queryLower)) {
                    matchField = 'note';
                    matchText = lesson.note;
                }
                // Search in bullets
                else if (lesson.bullets) {
                    const matchingBullet = lesson.bullets.find(b => b.toLowerCase().includes(queryLower));
                    if (matchingBullet) {
                        matchField = 'bullets';
                        matchText = matchingBullet;
                    }
                }
                // Search in attributes
                else if (lesson.attributes) {
                    const matchingAttr = lesson.attributes.find(
                        a => a.name.toLowerCase().includes(queryLower) || a.description.toLowerCase().includes(queryLower)
                    );
                    if (matchingAttr) {
                        matchField = 'attributes';
                        matchText = `${matchingAttr.name}: ${matchingAttr.description}`;
                    }
                }
                // Search in callouts
                else if (lesson.callouts) {
                    const matchingCallout = lesson.callouts.find(
                        c => c.title.toLowerCase().includes(queryLower) || c.body.toLowerCase().includes(queryLower)
                    );
                    if (matchingCallout) {
                        matchField = 'callouts';
                        matchText = `${matchingCallout.title}: ${matchingCallout.body}`;
                    }
                }

                if (matchField) {
                    results.push({
                        lesson,
                        category: categoryData.category,
                        categoryPath: categoryData.path,
                        matchField,
                        matchText,
                        lessonIndex
                    });
                }
            }
        }

        searchResults = results;
        showResults = true;
        isSearching = false;
    }

    function handleSearchInput(event: Event) {
        const target = event.target as HTMLInputElement;
        searchQuery = target.value;
        searchLessons(searchQuery);
    }

    async function navigateToResult(result: SearchResult) {
        // Navigate to the page with a hash for the lesson
        const lessonId = `lesson-${result.lessonIndex}`;
        showResults = false;
        searchQuery = '';
        
        // Check if we're navigating to the same page or a different page
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const isSamePage = currentPath === result.categoryPath;
        
        if (isSamePage) {
            // Same page - just update the hash and trigger hashchange event
            if (typeof window !== 'undefined') {
                window.location.hash = lessonId;
                // Manually trigger hashchange event to ensure the handler runs
                window.dispatchEvent(new HashChangeEvent('hashchange'));
            }
        } else {
            // Different page - navigate with hash
            await goto(`${result.categoryPath}#${lessonId}`, { 
                noScroll: true // Prevent automatic scroll, we'll handle it manually
            });
        }
    }

    function clearSearch() {
        searchQuery = '';
        searchResults = [];
        showResults = false;
    }

    let searchContainer: HTMLDivElement;
    
    // Close search results when clicking outside
    function handleClickOutside(event: MouseEvent) {
        if (typeof document === 'undefined') return;
        if (searchContainer && event.target && !searchContainer.contains(event.target as Node)) {
            showResults = false;
        }
    }

    onMount(() => {
        if (typeof document !== 'undefined') {
            document.addEventListener('mousedown', handleClickOutside);
        }
    });

    onDestroy(() => {
        if (typeof document !== 'undefined') {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    });

</script>

<div class="search-container" bind:this={searchContainer}>
    <div class="search-input-wrapper">
        <svg
            class="search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
        </svg>
        <input
            type="text"
            class="search-input"
            placeholder="Search HTML, CSS, JavaScript, Advanced JS..."
            value={searchQuery}
            on:input={handleSearchInput}
            on:focus={() => (showResults = searchResults.length > 0)}
        />
        {#if searchQuery}
            <button class="clear-button" on:click={clearSearch} aria-label="Clear search">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    ></path>
                </svg>
            </button>
        {/if}
    </div>

    {#if isSearching}
        <div class="search-status">Searching...</div>
    {/if}

    {#if showResults && searchResults.length > 0}
        <div class="search-results">
            <div class="results-header">
                <span class="results-count">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</span>
            </div>
            <div class="results-list">
                {#each searchResults as result}
                    <div class="result-item" on:click={() => navigateToResult(result)} role="button" tabindex="0">
                        <div class="result-category">{result.category}</div>
                        <div class="result-question">{result.lesson.question}</div>
                        <div class="result-match">
                            <span class="match-label">{result.matchField}:</span>
                            <span class="match-text">{result.matchText}</span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {:else if showResults && searchQuery && !isSearching}
        <div class="search-results">
            <div class="no-results">No results found for "{searchQuery}"</div>
        </div>
    {/if}
</div>

<style>
    .search-container {
        position: relative;
        width: 100%;
        max-width: 800px;
        margin: 0 auto 2rem auto;
        font-family: 'Poppins', Arial, sans-serif;
    }

    .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.4);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
    }

    .search-input-wrapper:focus-within {
        border-color: rgba(251, 191, 36, 0.5);
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
    }

    .search-icon {
        width: 1.25rem;
        height: 1.25rem;
        color: rgba(255, 255, 255, 0.5);
        margin-right: 0.75rem;
        flex-shrink: 0;
    }

    .search-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: white;
        font-size: 1rem;
        font-family: 'Poppins', Arial, sans-serif;
    }

    .search-input::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }

    .clear-button {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s ease;
        margin-left: 0.5rem;
    }

    .clear-button:hover {
        color: rgba(255, 255, 255, 0.8);
    }

    .clear-button svg {
        width: 1.25rem;
        height: 1.25rem;
    }

    .search-status {
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
        padding: 1rem;
        font-size: 0.9rem;
    }

    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 0.5rem;
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
        max-height: 500px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(10px);
    }

    .results-header {
        padding: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .results-count {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.875rem;
        font-weight: 600;
    }

    .results-list {
        max-height: 400px;
        overflow-y: auto;
    }

    .result-item {
        padding: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .result-item:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .result-item:last-child {
        border-bottom: none;
    }

    .result-category {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: rgba(251, 191, 36, 0.2);
        color: #fbbf24;
        border-radius: 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
    }

    .result-question {
        color: white;
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 0.5rem;
    }

    .result-match {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.875rem;
        display: flex;
        gap: 0.5rem;
    }

    .match-label {
        font-weight: 600;
        color: rgba(255, 255, 255, 0.4);
        text-transform: capitalize;
    }

    .match-text {
        flex: 1;
    }

    .no-results {
        padding: 2rem;
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9rem;
    }

    /* Scrollbar styling */
    .search-results::-webkit-scrollbar,
    .results-list::-webkit-scrollbar {
        width: 8px;
    }

    .search-results::-webkit-scrollbar-track,
    .results-list::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }

    .search-results::-webkit-scrollbar-thumb,
    .results-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
    }

    .search-results::-webkit-scrollbar-thumb:hover,
    .results-list::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }
</style>


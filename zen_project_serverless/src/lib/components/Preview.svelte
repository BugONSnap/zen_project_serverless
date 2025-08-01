<script lang="ts">
    export let htmlCode: string = '';
    export let cssCode: string = '';
    export let jsCode: string = '';

    let iframe: HTMLIFrameElement;
    let iframeDocument: Document | null = null;
    let consoleOutput: string[] = [];

    function updateIframeContent() {
        if (iframe && iframe.contentDocument) {
            iframeDocument = iframe.contentDocument;
            consoleOutput = [];

            // Clear existing content to prevent bleed-through
            iframeDocument.open();
            iframeDocument.write('');
            iframeDocument.close();

            // Create the HTML document structure
            const htmlDoc = iframeDocument.implementation.createHTMLDocument('Playground Preview');
            
            // Set up the head
            const head = htmlDoc.head;
            const meta1 = htmlDoc.createElement('meta');
            meta1.setAttribute('charset', 'UTF-8');
            const meta2 = htmlDoc.createElement('meta');
            meta2.setAttribute('name', 'viewport');
            meta2.setAttribute('content', 'width=device-width, initial-scale=1.0');
            const title = htmlDoc.createElement('title');
            title.textContent = 'Playground Preview';
            
            // Create and add CSS
            const style = htmlDoc.createElement('style');
            style.textContent = `
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: #fff;
                    padding: 20px;
                    /* Hide scrollbar for Chrome, Safari and Opera */
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                    overflow: hidden; /* Ensure no scrollbars */
                }
                
                body::-webkit-scrollbar {
                    display: none;
                }
                
                ${cssCode}
            `;
            
            head.appendChild(meta1);
            head.appendChild(meta2);
            head.appendChild(title);
            head.appendChild(style);
            
            // Set up the body
            const body = htmlDoc.body;
            body.innerHTML = htmlCode;
            
            // Add console override script
            const consoleScript = htmlDoc.createElement('script');
            consoleScript.textContent = `
                // Override console methods to capture output
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;
                const originalInfo = console.info;
                
                function sendToParent(type, ...args) {
                    const message = args.map(arg => 
                        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    ).join(' ');
                    
                    window.parent.postMessage({
                        type: 'console',
                        method: type,
                        message: message
                    }, '*');
                }
                
                console.log = (...args) => {
                    originalLog.apply(console, args);
                    sendToParent('log', ...args);
                };
                
                console.error = (...args) => {
                    originalError.apply(console, args);
                    sendToParent('error', ...args);
                };
                
                console.warn = (...args) => {
                    originalWarn.apply(console, args);
                    sendToParent('warn', ...args);
                };
                
                console.info = (...args) => {
                    originalInfo.apply(console, args);
                    sendToParent('info', ...args);
                };
            `;
            body.appendChild(consoleScript);
            
            // Add user's JavaScript code
            const userScript = htmlDoc.createElement('script');
            userScript.textContent = `
                try {
                    ${jsCode}
                } catch (error) {
                    console.error('JavaScript Error:', error.message);
                }
            `;
            body.appendChild(userScript);
            
            // Write the document to iframe
            iframeDocument.open();
            iframeDocument.write(htmlDoc.documentElement.outerHTML);
            iframeDocument.close();
        }
    }

    // Listen for console messages from iframe
    function handleMessage(event: MessageEvent) {
        if (event.data.type === 'console') {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = `[${timestamp}] ${event.data.method.toUpperCase()}: ${event.data.message}`;
            consoleOutput = [...consoleOutput, logEntry];
        }
    }

    // Set up message listener
    if (typeof window !== 'undefined') {
        window.addEventListener('message', handleMessage);
    }

    // Use a reactive statement that triggers update when any code changes
    $: if (iframe && (htmlCode !== undefined || cssCode !== undefined || jsCode !== undefined)) {
        updateIframeContent();
    }
</script>

<div class="flex flex-col h-full bg-white rounded-lg overflow-hidden border border-gray-200">
    <!-- Preview Header -->
    <div class="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h3 class="text-sm font-medium text-gray-700 flex items-center">
           
          
        </h3>
        <div class="flex items-center space-x-2">
            <span class="text-xs text-gray-500">Console Output</span>
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
    </div>

    <!-- Preview Content -->
    <div class="flex-1 relative">
        <iframe
            bind:this={iframe}
            class="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            title="Code Preview"
        ></iframe>
    </div>

    <!-- Console Output -->
    {#if consoleOutput.length > 0}
        <div class="border-t border-gray-200 bg-gray-900 text-green-400 p-3 max-h-32 overflow-y-auto md:max-h-40 md:overflow-y-auto sm:max-h-48 sm:overflow-y-auto lg:max-h-56 lg:overflow-y-auto xl:max-h-64 xl:overflow-y-auto" style="max-height:40vh;">
            <div class="text-xs font-mono space-y-1">
                {#each consoleOutput as output}
                    <div class="whitespace-pre-wrap">{output}</div>
                {/each}
            </div>
        </div>
    {/if}
</div> 
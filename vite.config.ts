import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    tailwindcss({
      // Add this to prevent the 'enhance' function from being processed by Tailwind
      // This tells Tailwind to ignore the 'enhance' function in Svelte files
      // and prevents the invalid declaration error
      content: {
        files: [
          './src/**/*.{html,js,svelte,ts}',
          './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
        ],
        // Ignore the 'enhance' function in Svelte files
        transform: {
          svelte: (content) => {
            return content.replace(/use:enhance/g, 'use:enhance-clean');
          }
        }
      }
    })
  ],
  // Add this to handle the 'enhance' function in Svelte files
  optimizeDeps: {
    include: ['@sveltejs/kit', 'svelte', 'svelte/internal', 'svelte/store']
  },
  // Add this to handle the 'enhance' function in Svelte files
  ssr: {
    noExternal: ['@sveltejs/kit', 'svelte/internal']
  }
});

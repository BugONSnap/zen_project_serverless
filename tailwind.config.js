/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Extend with your custom colors here
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('flowbite/plugin')
  ],
  // Add this to handle the enhance function
  corePlugins: {
    preflight: false, // Disable preflight to prevent conflicts with existing styles
  },
  // Add this to handle the enhance function
  safelist: [
    'enhance',
    'use:enhance'
  ]
}

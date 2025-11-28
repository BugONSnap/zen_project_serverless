<script lang="ts">
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { derived } from 'svelte/store';

const pages = [
  { name: 'HTML LESSONS', path: '/learn' },
  { name: 'CSS LESSONS', path: '/learn/css' },
  { name: 'JS LESSONS', path: '/learn/javascript-learn' },
  { name: 'ADVANCED JS', path: '/learn/advance-javascript' }
];

// Compute current page index based on the current route
import { onDestroy } from 'svelte';

let currentIdx = 0;
const unsubscribe = page.subscribe($page => {
  const idx = pages.findIndex(p => $page.url.pathname === p.path);
  currentIdx = idx !== -1 ? idx : 0;
});

onDestroy(unsubscribe);

function cycle(direction: number, current: number) {
  const next = (current + direction + pages.length) % pages.length;
  goto(pages[next].path);
}
</script>

<nav class="mini-header">
  <button on:click={() => cycle(-1, currentIdx)}>&lt;</button>
  <span>{pages[currentIdx].name}</span>
  <button on:click={() => cycle(1, currentIdx)}>&gt;</button>
</nav>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Poppins:wght@700&display=swap');

.mini-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: linear-gradient(to right, #1a1f2e 0%, #111827 50%, #0f172a 100%);
  color: white;
  padding: 0.5rem 2rem;
  border-radius: 0.5rem;
  margin: 0 auto 1.5rem auto;
  border-bottom: 1px solid rgba(217, 119, 6, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  font-family: 'Poppins', Arial, sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  max-width: 500px;
  transition: all 0.3s ease;
  margin-top: 13px;
  position: sticky;
  top: 68px; /* Height of the DashboardHeader */
  z-index: 999;
}
.mini-header button {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-family: 'Montserrat', Arial, sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.35rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mini-header span {
  font-family: 'Poppins', Arial, sans-serif;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-weight: bold;
  font-size: 1.25rem;
  letter-spacing: 0.02em;
  color: #fff;
}
</style>

<script lang="ts">
import DashboardHeader from '$lib/DashboardHeader.svelte';
import MiniHeader from '../MiniHeader.svelte';

export let data: { user: { id: number; username: string; email: string } | null };

const lastUpdated = '08 Nov, 2025';

const introPoints = [
  'Advanced JavaScript covers concepts like closures, async programming, prototypes, and ES6+ features.',
  'Deepen your understanding of how JS engines work and how to write efficient, modern code.',
  'You can leverage advanced JS to build scalable, maintainable, and high-performance applications.'
];

const codeSample = `// Example: Closure\nfunction makeCounter() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  }\n}\nconst counter = makeCounter();\ncounter(); // 1\ncounter(); // 2`;

const conceptCards = [
  {
    title: 'Closure',
    description: 'A closure is a function that remembers its outer variables even after the outer function has executed.',
    highlight: 'Example: function outer() { let x = 1; return function() { return x; } }'
  },
  {
    title: 'Async & Await',
    description: 'Modern JavaScript uses async/await for readable asynchronous code. Promises are the foundation.',
    highlight: 'Example: async function getData() { const res = await fetch(url); }'
  },
  {
    title: 'Prototype & Class',
    description: 'JS uses prototypes for inheritance. ES6+ introduced class syntax for cleaner OOP.',
    highlight: 'Example: class Animal { speak() { ... } }'
  }
];

const LESSONS_PER_PAGE = 30;
let currentPage = 1;

const advJsLessons = [
  {
    question: 'What is a closure in JavaScript?',
    answer: 'A closure is a function that retains access to its lexical scope, even when executed outside that scope. It enables powerful patterns like data privacy and function factories.',
    snippet: 'function outer() {\n  let x = 10;\n  return function() { return x; };\n}\nconst getX = outer();\ngetX(); // 10',
    bullets: [
      'Closures capture variables, not values.',
      'Common in callbacks and event handlers.'
    ],
    references: [
      { label: 'MDN – Closures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures' }
    ]
  },
  {
    question: 'How does async/await work?',
    answer: 'async/await is syntactic sugar over Promises, making asynchronous code look synchronous. await pauses execution until a Promise resolves.',
    snippet: 'async function fetchData() {\n  const res = await fetch("/api");\n  const data = await res.json();\n  return data;\n}',
    bullets: [
      'Use try/catch for error handling with async/await.',
      'You can await any Promise.'
    ],
    references: [
      { label: 'MDN – async/await', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function' }
    ]
  },
  {
    question: 'What is prototypal inheritance?',
    answer: 'JavaScript objects inherit properties and methods via the prototype chain. ES6 class syntax is built on prototypes.',
    snippet: 'function Animal() {}\nAnimal.prototype.speak = function() {\n  return "Roar";\n};\nconst lion = new Animal();\nlion.speak(); // "Roar"',
    bullets: [
      'Every object has a prototype (except Object.create(null)).',
      'Use Object.getPrototypeOf(obj) to inspect the prototype.'
    ],
    references: [
      { label: 'MDN – Prototypes', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain' }
    ]
  },
  {
    question: 'What are ES6+ features?',
    answer: 'ES6 (ECMAScript 2015) and later versions added let/const, arrow functions, classes, template literals, destructuring, modules, and more.',
    snippet: 'const [a, b] = [1, 2];\nconst sum = (x, y) => x + y;',
    bullets: [
      'Use import/export for modular code.',
      'Destructuring makes code concise.'
    ],
    references: [
      { label: 'MDN – ES6 Features', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_2015_support_in_Mozilla' }
    ]
  },
  {
    question: 'How do you handle errors in async code?',
    answer: 'Use try/catch blocks with async/await. For Promises, use .catch().',
    snippet: 'async function main() {\n  try {\n    await fetchData();\n  } catch (e) {\n    console.error(e);\n  }\n}',
    bullets: [
      'Always handle errors to avoid unhandled promise rejections.',
      'Promise chains can use .catch().' 
    ],
    references: [
      { label: 'MDN – Error Handling', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#Error_propagation' }
    ]
  }
];

$: totalPages = Math.ceil(advJsLessons.length / LESSONS_PER_PAGE);
$: pageOffset = (currentPage - 1) * LESSONS_PER_PAGE;
$: paginatedLessons = advJsLessons.slice(pageOffset, pageOffset + LESSONS_PER_PAGE);

function goToPage(page: number) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
</script>

<div class="min-h-screen text-[#4a1c1c] font-medium relative dashboard-bg" style="background: linear-gradient(to bottom, #ffbdbd 0%, #ff9b9b 50%, #ff7b7b 100%); overflow: visible;">
  <DashboardHeader title="Advanced JavaScript" user={data.user || undefined} />
  <MiniHeader />

  <section class="max-w-6xl mx-auto px-4 py-10 space-y-10">
    <div class="rounded-3xl border border-white/15 bg-[#090303]/70 p-8 shadow-2xl backdrop-blur">
      <div class="flex flex-col gap-8 lg:flex-row">
        <div class="flex-1 space-y-4">
          <div class="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
            <span>Advanced JS</span>
            <span class="h-3 w-px bg-white/30"></span>
            <span>Last Updated · {lastUpdated}</span>
          </div>
          <h1 class="text-4xl font-semibold text-white">Master Advanced JavaScript</h1>
          <p class="text-white/80">
            Explore closures, async/await, prototypes, and the latest ES6+ features to write robust and modern JavaScript.
          </p>
          <ul class="space-y-3 rounded-2xl bg-black/40 p-5">
            {#each introPoints as point}
              <li class="flex gap-3 text-white/85">
                <span class="mt-1.5 h-2 w-2 flex-none rounded-full bg-emerald-400"></span>
                <span>{point}</span>
              </li>
            {/each}
          </ul>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-white/50">Language Type</p>
              <p class="mt-2 text-xl font-semibold text-white">Script · Imperative</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-white/50">Primary Job</p>
              <p class="mt-2 text-xl font-semibold text-white">Advanced Logic</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-white/50">Best Combo</p>
              <p class="mt-2 text-xl font-semibold text-white">HTML + CSS + JS</p>
            </div>
          </div>
        </div>
        <div class="flex-1 rounded-2xl border border-emerald-500/30 bg-[#050505] p-4 shadow-inner">
          <div class="flex items-center justify-between text-xs text-white/60">
            <span>advanced.js</span>
            <div class="space-x-2">
              <span class="inline-block h-3 w-3 rounded-full bg-red-500"></span>
              <span class="inline-block h-3 w-3 rounded-full bg-amber-400"></span>
              <span class="inline-block h-3 w-3 rounded-full bg-emerald-400"></span>
            </div>
          </div>
          <pre class="mt-4 h-full overflow-auto rounded-xl bg-gradient-to-b from-[#090909] to-[#050505] p-4 text-sm leading-relaxed text-emerald-200"><code>{@html codeSample}</code></pre>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      {#each conceptCards as card}
        <div class="rounded-2xl border border-white/10 bg-black/50 p-6 shadow-lg backdrop-blur">
          <p class="text-xs uppercase tracking-[0.35em] text-white/60">{card.title}</p>
          <p class="mt-3 text-white/85">{card.description}</p>
          <p class="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm text-emerald-200">{card.highlight}</p>
        </div>
      {/each}
    </div>
    <div class="rounded-3xl border border-white/10 bg-black/40 p-8 shadow-xl backdrop-blur mt-12">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-white/60">Advanced JS Lessons</p>
          <h2 class="text-3xl font-semibold text-white">Advanced JavaScript Fundamentals</h2>
        </div>
      </div>
      <div class="space-y-10 mt-6">
        <div class="relative space-y-8">
          <span class="pointer-events-none absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-emerald-400/70 via-white/20 to-transparent lg:block"></span>
          {#each paginatedLessons as block, index}
            <article class="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur">
              <div class="flex items-start gap-5">
                <div class="relative flex-none">
                  <span class="text-4xl font-extrabold text-white/20">{String(pageOffset + index + 1).padStart(2, '0')}</span>
                  <span class="absolute left-1/2 top-12 hidden h-10 w-px -translate-x-1/2 bg-white/10 lg:block"></span>
                </div>
                <div class="flex-1 space-y-3">
                  <h3 class="text-xl font-semibold text-white">{block.question}</h3>
                  <p class="text-white/85">{block.answer}</p>
                  {#if block.snippet}
                    <pre class="max-w-full overflow-x-auto rounded-xl bg-[#0f0f0f]/80 p-4 text-sm text-emerald-200 whitespace-pre-wrap break-words"><code>{@html block.snippet}</code></pre>
                  {/if}
                  {#if block.bullets}
                    <ul class="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/85">
                      {#each block.bullets as bullet}
                        <li class="flex gap-2">
                          <span class="mt-1 h-2 w-2 flex-none rounded-full bg-emerald-300"></span>
                          <span>{bullet}</span>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                  {#if block.note}
                    <p class="text-sm text-amber-200/90">{block.note}</p>
                  {/if}
                  {#if block.callouts}
                    {#each block.callouts as callout}
                      <div
                        class={`rounded-2xl border px-4 py-3 text-sm ${callout.tone === 'warning'
                          ? 'border-amber-400/40 bg-amber-400/10 text-amber-100'
                          : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'}`}
                      >
                        <p class="font-semibold uppercase tracking-wide text-xs">{callout.title}</p>
                        <p class="mt-1 text-white/90">{callout.body}</p>
                      </div>
                    {/each}
                  {/if}
                  {#if block.attributes}
                    <div class="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
                      <p class="text-xs uppercase tracking-[0.3em] text-white/60">Attributes</p>
                      <dl class="mt-3 w-full space-y-3">
                        {#each block.attributes as attr}
                          <div class="rounded-xl bg-white/5 p-3">
                            <div class="flex items-center gap-2">
                              <dt class="font-semibold text-emerald-200">{attr.name}</dt>
                              {#if attr.badge}
                                <span class="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-200">{attr.badge}</span>
                              {/if}
                            </div>
                            <dd class="mt-1 text-white/85">{attr.description}</dd>
                          </div>
                        {/each}
                      </dl>
                    </div>
                  {/if}
                  <div class="flex flex-wrap gap-2 text-xs">
                    {#each block.references as ref}
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="rounded-full border border-white/15 px-3 py-1 text-emerald-200 transition-colors hover:border-emerald-300 hover:text-emerald-100"
                      >
                        {ref.label}
                      </a>
                    {/each}
                  </div>
                </div>
              </div>
            </article>
          {/each}
          <div class="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p>Page {currentPage} of {totalPages}</p>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  class="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wide disabled:opacity-30"
                  on:click={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                {#each Array(totalPages) as _, pageIndex}
                  <button
                    class={`rounded-full border px-3 py-1 text-xs ${currentPage === pageIndex + 1
                      ? 'border-emerald-400 text-emerald-200'
                      : 'border-white/20 text-white/70 hover:border-white/40'}`}
                    on:click={() => goToPage(pageIndex + 1)}
                  >
                    {pageIndex + 1}
                  </button>
                {/each}
                <button
                  class="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wide disabled:opacity-30"
                  on:click={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
<style>
.dashboard-bg, body, html {
    font-family: 'Montserrat', Arial, sans-serif;
    overflow: visible;
}
h1, h2, h3, h4, h5, h6, .dashboard-heading {
    font-family: 'Poppins', Arial, sans-serif;
    font-weight: 700;
}
p, span, small, .dashboard-body, .text-sm, .text-xs {
    font-family: 'Montserrat', Arial, sans-serif;
}
.dashboard-heading {
    font-size: 2.5rem;
}
.dashboard-subheading {
    font-size: 1.5rem;
    font-family: 'Montserrat', Arial, sans-serif;
    font-weight: 600;
}
.dashboard-stat {
    font-size: 2rem;
    font-family: 'Poppins', Arial, sans-serif;
    font-weight: 700;
}
.dashboard-body {
    font-size: 1.1rem;
    font-family: 'Montserrat', Arial, sans-serif;
}
.card-candy {
    background: #ffdcdc;
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px 0 rgba(255, 155, 155, 0.15);
    border: 2px solid #ffbdbd;
}
</style>
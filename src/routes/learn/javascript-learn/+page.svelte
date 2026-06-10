<script lang="ts">
import DashboardHeader from '$lib/DashboardHeader.svelte';
import MiniHeader from '../MiniHeader.svelte';
import SearchComponent from '../SearchComponent.svelte';

export let data: { user: { id: number; username: string; email: string } | null };

const lastUpdated = '08 Nov, 2025';

const introPoints = [
  'JavaScript (JS) is the programming language of the web: it powers dynamic behavior and interactivity.',
  'JS lets you manipulate HTML/CSS, handle events, fetch data, and build complex applications.',
  'You add JavaScript to HTML using the <script> tag, or link to external .js files.'
];

const codeSample = `// Change text on button click\ndocument.querySelector('button').onclick = function() {\n  document.body.style.background = '#ffe066';\n  alert('Hello, JavaScript!');\n}`;

const conceptCards = [
  {
    title: 'Variable',
    description: 'Variables store data values. Use let, const, or var to declare them.',
    highlight: 'Example: let count = 0;'
  },
  {
    title: 'Function',
    description: 'Functions let you group code and run it on demand. Use function keyword or arrow syntax.',
    highlight: 'Example: const add = (a, b) => a + b;'
  },
  {
    title: 'Event & DOM',
    description: 'JavaScript responds to user events (click, input, etc.) and manipulates the DOM (web page structure).',
    highlight: 'Example: element.addEventListener("click", handler)'
  }
];

type Reference = {
  label: string;
  url: string;
};

type QuestionBlock = {
  question: string;
  answer: string;
  snippet?: string;
  note?: string;
  attributes?: { name: string; description: string; badge?: string }[];
  callouts?: { title: string; body: string; tone?: 'info' | 'warning' }[];
  bullets?: string[];
  references: Reference[];
};

const LESSONS_PER_PAGE = 30;
let currentPage = 1;

const jsLessons: QuestionBlock[] = [
  {
    question: 'What is JavaScript?',
    answer: 'JavaScript is a versatile, high-level programming language that runs in web browsers and servers. It enables dynamic content, interactivity, and complex application logic on web pages.',
    bullets: ['JS is interpreted and runs in the browser (or with Node.js on the server).', 'It is the third core web technology, alongside HTML and CSS.', 'Modern JS supports modules, async/await, and more.'],
    references: [{ label: 'MDN – JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' }]
  },
  {
    question: 'How do you declare a variable in JavaScript?',
    answer: 'Use let, const, or var to declare variables. let and const are block-scoped (preferred).',
    snippet: 'let score = 10;\nconst PI = 3.14;',
    bullets: ['Use const for values that never change.', 'var is function-scoped and mostly legacy.'],
    references: [{ label: 'MDN – Variables', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#Declarations' }]
  },
  {
    question: 'How do you write a function in JavaScript?',
    answer: 'Functions encapsulate reusable logic. Use function declarations or arrow functions.',
    snippet: 'function greet(name) {\n  return `Hello, ${name}!`;\n}\n// or\nconst greet = name => `Hello, ${name}!`;',
    bullets: ['Arrow functions are concise and inherit this from the parent scope.', 'Function declarations are hoisted.'],
    references: [{ label: 'MDN – Functions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions' }]
  },
  {
    question: 'How do you select an element in the DOM?',
    answer: 'Use document.querySelector or document.getElementById to select elements.',
    snippet: 'const btn = document.querySelector("button");',
    bullets: ['querySelector returns the first matching element.', 'You can use CSS selectors.'],
    references: [{ label: 'MDN – Document.querySelector', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector' }]
  },
  {
    question: 'How do you handle a button click?',
    answer: 'Attach an event listener to the button element.',
    snippet: 'button.addEventListener("click", function() {\n  alert("Clicked!");\n});',
    bullets: ['You can use anonymous or named functions as handlers.', 'Arrow functions are often used for concise handlers.'],
    references: [{ label: 'MDN – EventTarget.addEventListener', url: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener' }]
  },
  {
    question: 'How do you write a comment in JavaScript?',
    answer: 'Use // for single-line comments, or /* ... */ for multi-line comments.',
    snippet: '// This is a single-line comment\n/* This is\n   a multi-line comment */',
    bullets: ['Comments are ignored by the JS engine.', 'Use comments to explain logic or mark TODOs.'],
    references: [{ label: 'MDN – Comments', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#Comments' }]
  },
  {
    question: 'How do you change the text of an HTML element?',
    answer: 'Select the element and set its textContent or innerText property.',
    snippet: 'document.querySelector("h1").textContent = "New Title";',
    bullets: ['innerHTML lets you set HTML markup, but be careful with user input.', 'Always select the correct element before changing content.'],
    references: [{ label: 'MDN – textContent', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent' }]
  },
  {
    question: 'What is the difference between let, const, and var?',
    answer: 'let and const are block-scoped and recommended. var is function-scoped and can cause bugs due to hoisting.',
    snippet: 'if (true) {\n  let x = 1;\n  const y = 2;\n  var z = 3;\n}',
    references: [{ label: 'MDN – let', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let' }]
  },
  {
    question: 'What are JavaScript data types?',
    answer: 'Primitive types: string, number, boolean, undefined, null, symbol, bigint. Complex type: object.',
    snippet: 'let name = "Alice";\nlet age = 25;\nlet isActive = true;',
    references: [{ label: 'MDN – Data types', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures' }]
  },
  {
    question: 'How do you work with arrays in JavaScript?',
    answer: 'Arrays store ordered lists of values. Common methods: push, pop, map, filter, forEach.',
    snippet: 'const fruits = ["apple", "banana"];\nfruits.push("orange");',
    references: [{ label: 'MDN – Array', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array' }]
  },
  {
    question: 'How do you create and use objects in JavaScript?',
    answer: 'Objects are collections of key-value pairs used for modeling real-world data.',
    snippet: 'const user = { name: "John", age: 30, greet() { return "Hi"; } };',
    references: [{ label: 'MDN – Objects', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects' }]
  },
  {
    question: 'How do you use conditional statements?',
    answer: 'Use if, else if, else, and the ternary operator for decision making.',
    snippet: 'if (score > 90) console.log("A");\nelse if (score > 70) console.log("B");',
    references: [{ label: 'MDN – if...else', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else' }]
  },
  {
    question: 'How do you loop through data in JavaScript?',
    answer: 'Use for, while, for...of, forEach, or map to iterate over arrays and objects.',
    snippet: 'for (let i = 0; i < 5; i++) {}\narr.forEach(item => console.log(item));',
    references: [{ label: 'MDN – Loops', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration' }]
  },
  {
    question: 'What are template literals?',
    answer: 'Template literals use backticks and allow embedded expressions and multi-line strings.',
    snippet: 'const name = "Sara";\nconsole.log(`Hello, ${name}!`);',
    references: [{ label: 'MDN – Template literals', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals' }]
  },
  {
    question: 'What are arrow functions?',
    answer: 'Arrow functions provide a shorter syntax and lexically bind the this keyword.',
    snippet: 'const add = (a, b) => a + b;',
    bullets: ['No own this binding.', 'Cannot be used as constructors.'],
    references: [{ label: 'MDN – Arrow functions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions' }]
  },
  {
    question: 'What is hoisting in JavaScript?',
    answer: 'Hoisting is JavaScript\'s behavior of moving declarations to the top of their scope before execution.',
    bullets: ['Function declarations are fully hoisted.', 'let and const are hoisted but not initialized (Temporal Dead Zone).'],
    references: [{ label: 'MDN – Hoisting', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Hoisting' }]
  },
  {
    question: 'What is the difference between == and ===?',
    answer: '== performs type coercion. === checks both value and type (strict equality).',
    snippet: '0 == false;     // true\n0 === false;    // false',
    references: [{ label: 'MDN – Equality', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness' }]
  },
  {
    question: 'How do you manipulate CSS with JavaScript?',
    answer: 'Access and modify styles using the style property or classList.',
    snippet: 'element.style.color = "red";\nelement.classList.add("active");',
    references: [{ label: 'MDN – HTMLElement.style', url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style' }]
  },
  {
    question: 'How do you create elements dynamically?',
    answer: 'Use document.createElement() and append it to the DOM.',
    snippet: 'const div = document.createElement("div");\ndiv.textContent = "New content";\ndocument.body.appendChild(div);',
    references: [{ label: 'MDN – createElement', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement' }]
  },
  {
    question: 'What is event delegation?',
    answer: 'Event delegation attaches a single event listener to a parent element to handle events on its children.',
    bullets: ['More efficient for dynamic content.', 'Uses event bubbling.'],
    references: [{ label: 'MDN – Event delegation', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_delegation' }]
  },
  {
    question: 'How do you work with JSON in JavaScript?',
    answer: 'Use JSON.parse() to convert JSON string to object and JSON.stringify() to convert object to string.',
    snippet: 'const obj = JSON.parse(jsonString);\nconst str = JSON.stringify(obj);',
    references: [{ label: 'MDN – JSON', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON' }]
  },
  {
    question: 'How do you fetch data from an API?',
    answer: 'Use the Fetch API to make HTTP requests.',
    snippet: 'fetch("https://api.example.com/data")\n  .then(res => res.json())\n  .then(data => console.log(data));',
    references: [{ label: 'MDN – Fetch API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API' }]
  },
  {
    question: 'What is localStorage?',
    answer: 'localStorage allows you to store data persistently in the browser.',
    snippet: 'localStorage.setItem("key", "value");\nconst value = localStorage.getItem("key");',
    references: [{ label: 'MDN – localStorage', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage' }]
  },
  {
    question: 'How do you handle errors in JavaScript?',
    answer: 'Use try...catch blocks to handle runtime errors gracefully.',
    snippet: 'try {\n  riskyCode();\n} catch (error) {\n  console.error(error);\n}',
    references: [{ label: 'MDN – try...catch', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch' }]
  },
  {
    question: 'What is destructuring?',
    answer: 'Destructuring allows unpacking values from arrays or properties from objects into variables.',
    snippet: 'const { name, age } = user;\nconst [first, second] = array;',
    references: [{ label: 'MDN – Destructuring', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment' }]
  },
  {
    question: 'What are the spread and rest operators?',
    answer: 'Spread (...) expands iterables. Rest (...) collects multiple elements into an array.',
    snippet: 'const newArr = [...oldArr, 4, 5];\nfunction sum(...numbers) { return numbers.reduce((a,b)=>a+b); }',
    references: [{ label: 'MDN – Spread syntax', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax' }]
  },
  {
    question: 'What is scope in JavaScript?',
    answer: 'Scope determines the accessibility of variables. There are global, function, and block scope.',
    bullets: ['let and const are block-scoped.', 'var is function-scoped.'],
    references: [{ label: 'MDN – Scope', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Scope' }]
  },
  {
    question: 'What are modules in JavaScript?',
    answer: 'Modules allow you to break your code into separate files using import and export.',
    snippet: '// math.js\nexport const add = (a, b) => a + b;\n// main.js\nimport { add } from "./math.js";',
    references: [{ label: 'MDN – Modules', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules' }]
  },
  {
    question: 'What is the this keyword?',
    answer: 'this refers to the object that is executing the current function.',
    bullets: ['Behavior changes depending on context (global, object, arrow function).', 'Use .bind(), call(), or apply() to control it.'],
    references: [{ label: 'MDN – this', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this' }]
  }
];

// Search integration
const allLessonsForSearch = [
  { category: 'JavaScript', path: '/learn/javascript', lessons: jsLessons }
];

$: totalPages = Math.ceil(jsLessons.length / LESSONS_PER_PAGE);
$: pageOffset = (currentPage - 1) * LESSONS_PER_PAGE;
$: paginatedLessons = jsLessons.slice(pageOffset, pageOffset + LESSONS_PER_PAGE);

function goToPage(page: number) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Handle hash navigation to scroll to specific lesson
import { onMount } from 'svelte';

function scrollToLesson(lessonId: string) {
  if (typeof window === 'undefined') return;
  const match = lessonId.match(/^lesson-(\d+)$/);
  if (match) {
    const lessonIndex = parseInt(match[1]);
    const targetPage = Math.floor(lessonIndex / LESSONS_PER_PAGE) + 1;
    if (targetPage !== currentPage) {
      goToPage(targetPage);
      setTimeout(() => scrollToLessonElement(lessonId), 500);
    } else {
      scrollToLessonElement(lessonId);
    }
  }
}

function scrollToLessonElement(lessonId: string) {
  setTimeout(() => {
    const element = document.getElementById(lessonId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.classList.add('search-highlight');
      setTimeout(() => element.classList.remove('search-highlight'), 2000);
    }
  }, 100);
}

onMount(() => {
  if (typeof window === 'undefined') return;

  const initialHash = window.location.hash;
  if (initialHash) scrollToLesson(initialHash.substring(1));

  const handleHashChange = () => {
    const hash = window.location.hash;
    if (hash) scrollToLesson(hash.substring(1));
  };

  window.addEventListener('hashchange', handleHashChange);
  return () => window.removeEventListener('hashchange', handleHashChange);
});
</script>

<div class="min-h-screen text-white font-medium relative dashboard-bg" style="background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%); overflow: visible; font-family: poppins;">
    <!-- Animated gradient overlay -->
    <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
    <!-- Subtle dot pattern -->
    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>
  
  <DashboardHeader title="Learn JavaScript" user={data.user || undefined} pageName="Learn" />
  <MiniHeader />

  <!-- Search Component -->
  <div class="max-w-6xl mx-auto px-4 pt-6">
    <SearchComponent allLessons={allLessonsForSearch} />
  </div>

  <section class="max-w-6xl mx-auto px-4 py-10 space-y-10">
    <!-- Intro Card -->
    <div class="rounded-3xl border border-white/15 bg-[#090303]/70 p-8 shadow-2xl backdrop-blur">
      <div class="flex flex-col gap-8 lg:flex-row">
        <div class="flex-1 space-y-4">
          <div class="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
            <span>JS Introduction</span>
            <span class="h-3 w-px bg-amber-400/50"></span>
            <span>Last Updated · {lastUpdated}</span>
          </div>
          <h1 class="text-4xl font-semibold text-white">Make the Web Dynamic with JavaScript</h1>
          <p class="text-white/80">
            JavaScript is the scripting language that brings interactivity and logic to web pages. Learn how to use variables, functions, and events to build dynamic sites.
          </p>
          <ul class="space-y-3 rounded-2xl bg-black/40 p-5">
            {#each introPoints as point}
              <li class="flex gap-3 text-white/85">
                <span class="mt-1.5 h-2 w-2 flex-none rounded-full bg-amber-400"></span>
                <span>{point}</span>
              </li>
            {/each}
          </ul>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold">Language Type</p>
              <p class="mt-2 text-xl font-semibold text-amber-100">Script · Imperative</p>
            </div>
            <div class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold">Primary Job</p>
              <p class="mt-2 text-xl font-semibold text-amber-100">Interactivity</p>
            </div>
            <div class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold">Best Combo</p>
              <p class="mt-2 text-xl font-semibold text-amber-100">HTML + CSS</p>
            </div>
          </div>
        </div>
        <div class="flex-1 rounded-2xl border border-emerald-500/30 bg-[#050505] p-4 shadow-inner">
          <div class="flex items-center justify-between text-xs text-white/60">
            <span>script.js</span>
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

    <!-- Concept Cards -->
    <div class="grid gap-6 lg:grid-cols-3">
      {#each conceptCards as card}
        <div class="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-black/60 to-amber-950/20 p-6 shadow-lg backdrop-blur hover:border-amber-400/60 transition">
          <p class="text-xs uppercase tracking-[0.35em] text-amber-300 font-semibold">{card.title}</p>
          <p class="mt-3 text-white/85">{card.description}</p>
          <p class="mt-4 rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-200 border border-amber-500/30">{card.highlight}</p>
        </div>
      {/each}
    </div>

    <!-- Lessons Section -->
    <div class="rounded-3xl border border-white/10 bg-black/40 p-8 shadow-xl backdrop-blur mt-12">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-white/60">JavaScript Lessons</p>
          <h2 class="text-3xl font-semibold text-white">JavaScript Fundamentals</h2>
        </div>
      </div>
      <div class="space-y-10 mt-6">
        <div class="relative space-y-8">
          <span class="pointer-events-none absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-emerald-400/70 via-white/20 to-transparent lg:block"></span>
          
          {#each paginatedLessons as block, index}
            <article id="lesson-{pageOffset + index}" class="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur">
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
                  <div class="flex flex-wrap gap-2 text-xs">
                    {#each block.references as ref}
                      <a href={ref.url} target="_blank" rel="noopener noreferrer" class="rounded-full border border-white/15 px-3 py-1 text-emerald-200 transition-colors hover:border-emerald-300 hover:text-emerald-100">
                        {ref.label}
                      </a>
                    {/each}
                  </div>
                </div>
              </div>
            </article>
          {/each}

          <!-- Pagination -->
          <div class="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p>Page {currentPage} of {totalPages}</p>
              <div class="flex flex-wrap items-center gap-2">
                <button class="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wide disabled:opacity-30" on:click={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                {#each Array(totalPages) as _, pageIndex}
                  <button class={`rounded-full border px-3 py-1 text-xs ${currentPage === pageIndex + 1 ? 'border-emerald-400 text-emerald-200' : 'border-white/20 text-white/70 hover:border-white/40'}`} on:click={() => goToPage(pageIndex + 1)}>
                    {pageIndex + 1}
                  </button>
                {/each}
                <button class="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wide disabled:opacity-30" on:click={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
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

.search-highlight {
    animation: highlightPulse 2s ease-in-out;
    border-color: rgba(251, 191, 36, 0.6) !important;
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.3) !important;
}

@keyframes highlightPulse {
    0%, 100% { border-color: rgba(251, 191, 36, 0.6); box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
    50% { border-color: rgba(251, 191, 36, 0.9); box-shadow: 0 0 30px rgba(251, 191, 36, 0.5); }
}
</style>
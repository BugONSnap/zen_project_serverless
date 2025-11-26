<script lang="ts">
import DashboardHeader from '$lib/DashboardHeader.svelte';
import MiniHeader from '../MiniHeader.svelte';

const lastUpdated = '08 Nov, 2025';

const introPoints = [
  'CSS stands for Cascading Style Sheets: it controls the look and feel of web pages.',
  'CSS lets you change colors, layout, spacing, fonts, and adapt to different devices.',
  'You link CSS to HTML using the <link> tag, or write it in <style> blocks or external files.'
];

const codeSample = `body {\n  background: #f3f3f3;\n  color: #222;\n  font-family: Arial, sans-serif;\n}\nh1 {\n  color: #c0392b;\n}\n.button {\n  padding: 0.5em 1em;\n  border-radius: 6px;\n  background: #6F1414;\n  color: #fff;\n}`;

const conceptCards = [
  {
    title: 'Selector',
    description: 'A selector targets HTML elements to apply styles. It can be a tag, class, id, or attribute.',
    highlight: 'Example: .button, #main, h1, [type="text"]'
  },
  {
    title: 'Property & Value',
    description: 'Properties define what aspect you want to style (like color or margin); values set how.',
    highlight: 'Example: color: #fff; margin: 2rem;'
  },
  {
    title: 'Cascade & Specificity',
    description: 'The cascade decides which rule wins when multiple styles apply. Specificity and order matter.',
    highlight: 'Inline > ID > Class > Tag > Browser Default'
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

const cssLessons: QuestionBlock[] = [
  {
    question: 'What does CSS stand for?',
    answer: 'CSS stands for Cascading Style Sheets. It is the language used to describe the presentation and layout of web pages, separate from their HTML structure. CSS enables you to control colors, fonts, spacing, positioning, and even animations across your site. By keeping style rules in CSS, you can change the look of an entire site by editing just one file.',
    bullets: [
      'CSS separates content (HTML) from presentation (styles).',
      'You can write CSS inline, in a <style> tag, or in external .css files.',
      'The “cascading” part means rules can override each other based on specificity and order.'
    ],
    references: [
      { label: 'MDN – CSS Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics' }
    ]
  },
  {
    question: 'Which property is used to set the height of an element in CSS?',
    answer: 'The height property in CSS sets the vertical size of an element. It can accept units like px, em, %, vh, and more. If the content is larger than the set height and overflow is not handled, it may spill out of the box.',
    snippet: 'div { height: 100px; }',
    bullets: [
      'height: auto (default) lets content determine the height.',
      'height: 100% makes the element as tall as its parent (if parent has a defined height).',
      'Use min-height and max-height to set limits.'
    ],
    references: [
      { label: 'MDN – height', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/height' }
    ]
  },
  {
    question: 'Which property is used to change the text color in CSS?',
    answer: 'The color property changes the foreground (text) color of an element. You can use named colors, hex codes, rgb(), or hsl().',
    snippet: 'p { color: #3498db; }',
    bullets: [
      'color only affects text, not backgrounds (use background-color for that).',
      'For accessibility, always ensure enough contrast between text and background.'
    ],
    references: [
      { label: 'MDN – color', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color' }
    ]
  },
  {
    question: 'Which HTML tag is used to link an external CSS file?',
    answer: 'The <link> tag, placed inside the <head> of your HTML, links external CSS files. This keeps your styles modular and maintainable. The rel attribute should be "stylesheet".',
    snippet: '<link rel="stylesheet" href="styles.css">',
    bullets: [
      'You can link multiple CSS files; they cascade in the order listed.',
      'Browsers cache external CSS for faster loading.'
    ],
    references: [
      { label: 'MDN – <link>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link' }
    ]
  },
  {
    question: 'How do you select all <p> elements in CSS?',
    answer: 'Use the type selector p to target every <p> element on the page. Type selectors match all elements of a given tag name.',
    snippet: 'p { font-family: Georgia, serif; }',
    bullets: [
      'You can combine selectors: p.intro selects <p class="intro">.',
      'To select all elements, use the universal selector: * { ... }.'
    ],
    references: [
      { label: 'MDN – Selectors', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Type_selectors' }
    ]
  },
  {
    question: 'Which CSS property is used to set the background color?',
    answer: 'background-color sets the background color of an element. It accepts named colors, hex, rgb(), hsl(), and even gradients (with background-image).',
    snippet: 'body { background-color: #222; }',
    bullets: [
      'background-color: transparent is the default for most elements.',
      'background can also set images, repeat, position, and more.'
    ],
    references: [
      { label: 'MDN – background-color', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/background-color' }
    ]
  },
  {
    question: 'How do you write a CSS comment?',
    answer: 'CSS comments start with /* and end with */. Comments are ignored by browsers and are useful for documentation or disabling code.',
    snippet: '/* This is a CSS comment */',
    bullets: [
      'Comments cannot be nested in CSS.',
      'Use comments to explain complex rules or mark TODOs.'
    ],
    references: [
      { label: 'MDN – Comments', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Comments' }
    ]
  },
  {
    question: 'Which property is used to set the font size?',
    answer: 'font-size sets the size of the text. You can use absolute units (px, pt), relative units (em, rem), or percentages. Using rem or em makes your site more responsive and accessible.',
    snippet: 'h1 { font-size: 2.5rem; }',
    bullets: [
      '1rem equals the root element’s font-size (default 16px in most browsers).',
      'Use relative units for better scalability and accessibility.'
    ],
    references: [
      { label: 'MDN – font-size', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/font-size' }
    ]
  },
  {
    question: 'Which symbol is used to select a class in CSS?',
    answer: 'A dot (.) is used to select a class. Class selectors let you style multiple elements by assigning them the same class name.',
    snippet: '.highlight { background: yellow; }',
    bullets: [
      'Class selectors are reusable; you can add the same class to many elements.',
      'You can combine classes: .btn.primary { ... }.'
    ],
    references: [
      { label: 'MDN – Class selectors', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Class_selectors' }
    ]
  },
  {
    question: 'Which property is used to add space inside an element (padding)?',
    answer: 'padding controls the space between the content of an element and its border. You can set padding on all sides, or individually (padding-top, padding-right, etc.).',
    snippet: 'div { padding: 20px; }',
    bullets: [
      'Padding is included in the box size only if box-sizing: border-box is set.',
      'You can use shorthand: padding: 10px 20px 5px 0; (top, right, bottom, left).'
    ],
    references: [
      { label: 'MDN – padding', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/padding' }
    ]
  },
  {
    question: 'Which property is used to add space outside an element (margin)?',
    answer: 'margin adds space outside the border of an element, pushing it away from other elements. Margins can collapse (combine) between vertical blocks.',
    snippet: 'div { margin: 20px; }',
    bullets: [
      'margin: auto is used for horizontal centering of block elements.',
      'Like padding, margin can be set per side or with shorthand.'
    ],
    references: [
      { label: 'MDN – margin', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/margin' }
    ]
  }
];

$: totalPages = Math.ceil(cssLessons.length / LESSONS_PER_PAGE);
$: pageOffset = (currentPage - 1) * LESSONS_PER_PAGE;
$: paginatedLessons = cssLessons.slice(pageOffset, pageOffset + LESSONS_PER_PAGE);

function goToPage(page: number) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
</script>

<div class="min-h-screen text-[#4a1c1c] font-medium relative dashboard-bg" style="background: linear-gradient(to bottom, #ffbdbd 0%, #ff9b9b 50%, #ff7b7b 100%); overflow: visible;">
  <DashboardHeader title="Learn CSS" />
  <MiniHeader />

  <section class="max-w-6xl mx-auto px-4 py-10 space-y-10">
    <div class="rounded-3xl border border-white/15 bg-[#090303]/70 p-8 shadow-2xl backdrop-blur">
      <div class="flex flex-col gap-8 lg:flex-row">
        <div class="flex-1 space-y-4">
          <div class="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
            <span>CSS Introduction</span>
            <span class="h-3 w-px bg-white/30"></span>
            <span>Last Updated · {lastUpdated}</span>
          </div>
          <h1 class="text-4xl font-semibold text-white">Style the Web with CSS</h1>
          <p class="text-white/80">
            CSS (Cascading Style Sheets) is the language for describing the presentation of web pages. Master selectors, properties, and the cascade to build beautiful, responsive layouts.
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
              <p class="mt-2 text-xl font-semibold text-white">Style Sheet · Declarative</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-white/50">Primary Job</p>
              <p class="mt-2 text-xl font-semibold text-white">Visual Design</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-white/50">Best Combo</p>
              <p class="mt-2 text-xl font-semibold text-white">HTML + JS</p>
            </div>
          </div>
        </div>
        <div class="flex-1 rounded-2xl border border-emerald-500/30 bg-[#050505] p-4 shadow-inner">
          <div class="flex items-center justify-between text-xs text-white/60">
            <span>style.css</span>
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
          <p class="text-xs uppercase tracking-[0.35em] text-white/60">CSS Lessons</p>
          <h2 class="text-3xl font-semibold text-white">CSS Fundamentals</h2>
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
<script lang="ts">
import DashboardHeader from '$lib/DashboardHeader.svelte';
import MiniHeader from '../MiniHeader.svelte';
import SearchComponent from '../SearchComponent.svelte';

export let data: { user: { id: number; username: string; email: string } | null };

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
   
    question: 'What does CSS stand for and what is it used for?',
    answer:
      'CSS stands for Cascading Style Sheets. It is the language that controls the visual presentation of HTML elements — colors, fonts, spacing, layout, and animations. Keeping styles in CSS means you can restyle an entire site by editing one file without touching the HTML.',
    bullets: [
      'CSS separates content (HTML) from presentation (styles).',
      'Write CSS inline (style=""), in a <style> tag, or in an external .css file.',
      'The "cascading" part means multiple rules can apply; specificity and order determine which wins.'
    ],
    references: [
      { label: 'MDN – CSS Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics' }
    ]
  },
  {
    question: 'How do you link an external CSS file to HTML?',
    answer:
      'Place a <link> tag inside the <head> of your HTML. The rel attribute must be "stylesheet" and href points to your CSS file path.',
    snippet: '<link rel="stylesheet" href="styles.css">',
    bullets: [
      'You can link multiple CSS files; they apply in the order listed.',
      'Browsers cache external CSS files for faster repeat visits.',
      'Use media="print" to load a stylesheet only when printing.'
    ],
    references: [
      { label: 'MDN – <link>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link' }
    ]
  },
  {
    question: 'How do you write a CSS comment?',
    answer:
      'CSS comments are wrapped in /* and */. The browser ignores them entirely. Use comments to explain rules, mark sections, or temporarily disable code.',
    snippet: '/* This rule resets default spacing */\n* { margin: 0; padding: 0; }',
    bullets: [
      'CSS comments cannot be nested.',
      'Use comments to document why a rule exists, not just what it does.'
    ],
    references: [
      { label: 'MDN – Comments', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Comments' }
    ]
  },
 
  // ─── SELECTORS ───────────────────────────────────────────────────────────────
  {
    question: 'What are the main types of CSS selectors?',
    answer:
      'CSS selectors target which HTML elements to style. The main types are: type (tag name), class (.), ID (#), attribute ([attr]), pseudo-class (:hover), pseudo-element (::before), and combinator selectors (descendant, child, sibling).',
    snippet:
      'p { }           /* type — all <p> */\n.card { }       /* class */\n#hero { }       /* ID */\na:hover { }     /* pseudo-class */\np::first-line{} /* pseudo-element */\ndiv > p { }     /* direct child */\nh2 + p { }      /* adjacent sibling */\nh2 ~ p { }      /* general sibling */',
    bullets: [
      'Classes are reusable; IDs should be unique per page.',
      'Pseudo-classes target state (:focus, :checked, :nth-child).',
      'Pseudo-elements style a part of an element (::before, ::after, ::placeholder).'
    ],
    references: [
      { label: 'MDN – CSS Selectors', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors' }
    ]
  },
  {
    question: 'What is specificity and how is it calculated?',
    answer:
      'Specificity determines which CSS rule wins when multiple rules target the same element. It is scored as three tiers: IDs (0-1-0), classes/attributes/pseudo-classes (0-0-1 each), and type/pseudo-elements (0-0-0-1 each). Inline styles beat all. !important overrides everything.',
    snippet:
      '/* Specificity: 0,0,1 — one class */\n.btn { color: blue; }\n\n/* Specificity: 0,1,1 — one ID + one class */\n#nav .btn { color: red; } /* wins */\n\n/* Avoid !important — use it only as a last resort */\n.btn { color: green !important; }',
    bullets: [
      'Higher specificity wins regardless of order in the stylesheet.',
      'Equal specificity: the rule declared last wins (the "cascade").',
      'Avoid !important — it makes overriding styles very hard later.'
    ],
    references: [
      { label: 'MDN – Specificity', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity' }
    ]
  },
  {
    question: 'What is the CSS cascade?',
    answer:
      'The cascade is the algorithm CSS uses to resolve conflicts when multiple rules apply to the same element. It considers origin (browser defaults < author styles < user styles), importance (!important), specificity, and source order (last declared wins on a tie).',
    bullets: [
      'Browser default styles (user-agent stylesheet) have the lowest priority.',
      'Author styles (your CSS) override browser defaults.',
      'Inline styles beat external/internal stylesheets unless !important is involved.'
    ],
    references: [
      { label: 'MDN – Cascade', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade' }
    ]
  },
 
  // ─── BOX MODEL ───────────────────────────────────────────────────────────────
  {
    question: 'What is the CSS box model?',
    answer:
      'Every HTML element is a rectangular box made of four layers from inside out: content → padding → border → margin. By default (content-box), width/height only cover the content area. With box-sizing: border-box, width/height include padding and border — which is much more predictable.',
    snippet:
      '*, *::before, *::after {\n  box-sizing: border-box; /* best practice — apply globally */\n}\n\n.card {\n  width: 300px;     /* total width including padding + border */\n  padding: 1rem;\n  border: 2px solid #ccc;\n  margin: 1rem;\n}',
    bullets: [
      'content-box (default): width = content only. border-box: width = content + padding + border.',
      'Margin is always outside the box and does not affect the element\'s measured size.',
      'Apply box-sizing: border-box globally — it prevents many layout headaches.'
    ],
    references: [
      { label: 'MDN – Box Model', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model/Introduction_to_the_CSS_box_model' }
    ]
  },
  {
    question: 'What is the difference between padding and margin?',
    answer:
      'Padding is space inside the element between its content and its border. Margin is space outside the border, pushing the element away from others. Background colors fill padding but not margin.',
    snippet:
      '.box {\n  padding: 20px;  /* inside: pushes content away from border */\n  margin: 30px;   /* outside: pushes away from siblings */\n  background: lightblue; /* fills content + padding area */\n}',
    bullets: [
      'Vertical margins between block elements can collapse — only the larger value is used.',
      'margin: auto on a block element with a set width centers it horizontally.',
      'Padding can be set per side: padding-top, padding-right, padding-bottom, padding-left.'
    ],
    references: [
      { label: 'MDN – padding', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/padding' },
      { label: 'MDN – margin', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/margin' }
    ]
  },
 
  // ─── DISPLAY & POSITIONING ───────────────────────────────────────────────────
  {
    question: 'What does the display property do?',
    answer:
      'The display property controls how an element participates in the layout. The most common values are block (full width, stacks vertically), inline (flows with text, no width/height), inline-block (flows like inline but accepts width/height), flex, and grid.',
    snippet:
      'span { display: block; }        /* now takes full width */\ndiv  { display: inline; }        /* shrinks to content */\n.btn { display: inline-block; }  /* inline flow + box sizing */\n.container { display: flex; }    /* flex layout */\n.layout { display: grid; }       /* grid layout */\n.hidden { display: none; }       /* removed from layout entirely */',
    bullets: [
      'display: none removes the element from the layout (no space is reserved).',
      'visibility: hidden hides visually but keeps the space reserved.',
      'Most modern layouts use flexbox or grid instead of float or inline-block hacks.'
    ],
    references: [
      { label: 'MDN – display', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/display' }
    ]
  },
  {
    question: 'What are the CSS position values?',
    answer:
      'The position property determines how an element is placed in the document. static (default) follows normal flow. relative moves from its normal position without affecting others. absolute is removed from flow and positioned relative to the nearest non-static ancestor. fixed is relative to the viewport. sticky toggles between relative and fixed on scroll.',
    snippet:
      '.parent { position: relative; }\n\n.tooltip {\n  position: absolute;\n  top: -30px;   /* relative to .parent */\n  left: 0;\n}\n\n.navbar {\n  position: sticky;\n  top: 0; /* sticks when it reaches the top */\n}\n\n.overlay {\n  position: fixed;\n  inset: 0; /* covers the whole viewport */\n}',
    bullets: [
      'absolute/fixed elements are removed from normal flow — other elements ignore them.',
      'Use z-index to control stacking order of positioned elements.',
      'sticky requires a scroll container and a threshold property (top/left/etc.) to work.'
    ],
    references: [
      { label: 'MDN – position', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/position' }
    ]
  },
 
  // ─── FLEXBOX ─────────────────────────────────────────────────────────────────
  {
    question: 'How does Flexbox work?',
    answer:
      'Flexbox is a one-dimensional layout model. Set display: flex on a container, and its direct children become flex items. Items are arranged along the main axis (row by default). Use justify-content for main axis alignment and align-items for the cross axis.',
    snippet:
      '.container {\n  display: flex;\n  flex-direction: row;        /* or column */\n  justify-content: space-between; /* main axis */\n  align-items: center;        /* cross axis */\n  gap: 1rem;                  /* space between items */\n}\n\n.item {\n  flex: 1; /* grow to fill available space equally */\n}',
    bullets: [
      'flex-wrap: wrap lets items move to the next line when they overflow.',
      'flex: 1 is shorthand for flex-grow:1 flex-shrink:1 flex-basis:0.',
      'align-self on a child overrides the container\'s align-items for that item alone.'
    ],
    references: [
      { label: 'MDN – Flexbox', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout' }
    ]
  },
  {
    question: 'What are the key Flexbox alignment properties?',
    answer:
      'justify-content aligns items along the main axis. align-items aligns items along the cross axis. align-content aligns multiple rows/columns when wrapping. gap sets space between items without margin hacks.',
    snippet:
      '.flex {\n  display: flex;\n  justify-content: center;      /* center | flex-start | flex-end | space-between | space-around */\n  align-items: stretch;         /* stretch | center | flex-start | flex-end | baseline */\n  gap: 16px;                    /* row-gap + column-gap shorthand */\n}',
    bullets: [
      'space-between puts equal space between items; space-around includes edges.',
      'align-content only works when flex-wrap is active and there are multiple rows.',
      'Use gap instead of margin on flex items — cleaner and more predictable.'
    ],
    references: [
      { label: 'MDN – justify-content', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content' }
    ]
  },
 
  // ─── GRID ────────────────────────────────────────────────────────────────────
  {
    question: 'How does CSS Grid work?',
    answer:
      'CSS Grid is a two-dimensional layout system. Set display: grid on a container and define columns and rows with grid-template-columns/rows. Children are placed into grid cells automatically or explicitly with grid-column and grid-row.',
    snippet:
      '.layout {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr); /* 3 equal columns */\n  grid-template-rows: auto;\n  gap: 1.5rem;\n}\n\n.hero {\n  grid-column: 1 / -1; /* span all columns */\n}\n\n.sidebar {\n  grid-column: 3;\n  grid-row: 2 / 4;    /* span rows 2 and 3 */\n}',
    bullets: [
      '1fr means "one fraction of available space" — like flex: 1 but for grid tracks.',
      'repeat(auto-fill, minmax(200px, 1fr)) creates responsive columns without media queries.',
      'Use grid-template-areas for named, readable layout definitions.'
    ],
    references: [
      { label: 'MDN – CSS Grid', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout' }
    ]
  },
  {
    question: 'When should you use Grid vs Flexbox?',
    answer:
      'Use Flexbox for one-dimensional layouts — a row of buttons, a nav bar, a card\'s internal arrangement. Use Grid for two-dimensional layouts — page structure, image galleries, dashboards where you control both rows and columns.',
    snippet:
      '/* Flexbox — navigation bar (1D) */\nnav { display: flex; gap: 1rem; align-items: center; }\n\n/* Grid — page layout (2D) */\nbody {\n  display: grid;\n  grid-template-columns: 250px 1fr;\n  grid-template-rows: auto 1fr auto;\n}',
    bullets: [
      'Flexbox: content drives the layout. Grid: layout drives the content.',
      'You can nest a flexbox inside a grid cell and vice versa.',
      'Both are widely supported — there\'s no need for float-based layouts today.'
    ],
    references: [
      { label: 'MDN – Grid vs Flexbox', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Relationship_of_grid_layout_with_other_layout_methods' }
    ]
  },
 
  // ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────
  {
    question: 'What are the key CSS typography properties?',
    answer:
      'Core typography properties: font-family (typeface), font-size (size), font-weight (thickness), font-style (italic), line-height (vertical spacing between lines), letter-spacing, text-align, and text-decoration.',
    snippet:
      'body {\n  font-family: "Inter", system-ui, sans-serif;\n  font-size: 1rem;       /* 16px default */\n  font-weight: 400;\n  line-height: 1.6;      /* unitless — scales with font-size */\n}\n\nh1 {\n  font-size: clamp(2rem, 5vw, 4rem); /* responsive font size */\n  letter-spacing: -0.02em;\n}',
    bullets: [
      'Use unitless line-height (e.g. 1.5) — it scales with the element\'s own font-size.',
      'font-display: swap in @font-face prevents invisible text during font load.',
      'clamp(min, ideal, max) for fluid, responsive font sizes without media queries.'
    ],
    references: [
      { label: 'MDN – font', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/font' }
    ]
  },
  {
    question: 'What is the difference between em, rem, px, and %?',
    answer:
      'px is an absolute pixel value. em is relative to the current element\'s font-size (1.5em = 1.5× the current font-size). rem is relative to the root element\'s font-size (consistent across the page). % is relative to the parent element\'s value for that property.',
    snippet:
      ':root { font-size: 16px; } /* 1rem = 16px globally */\n\n.parent { font-size: 20px; }\n.child  { font-size: 1.5em; } /* 30px — relative to parent */\n\nh1 { font-size: 2rem; }  /* 32px — always relative to root */\n\n.box { width: 50%; }     /* 50% of parent\'s width */',
    bullets: [
      'Prefer rem for font sizes — avoids compounding em values across nested elements.',
      'Use % or viewport units (vw, vh) for fluid widths and heights.',
      'px is fine for borders, shadows, and fixed-size elements that should never scale.'
    ],
    references: [
      { label: 'MDN – CSS Values & Units', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units' }
    ]
  },
 
  // ─── COLORS ──────────────────────────────────────────────────────────────────
  {
    question: 'What color formats does CSS support?',
    answer:
      'CSS supports named colors (red, tomato), hex (#rrggbb or #rgb), rgb(), rgba() (with alpha/opacity), hsl() (hue, saturation, lightness), hsla(), and the modern oklch()/lch() for perceptually uniform colors. CSS custom properties (variables) are great for defining a color palette.',
    snippet:
      ':root {\n  --color-brand: #6366f1;\n  --color-text:  hsl(220 10% 15%);\n}\n\n.button {\n  background: var(--color-brand);\n  color: rgb(255 255 255 / 0.9); /* modern rgb with alpha */\n}\n\n.overlay {\n  background: rgb(0 0 0 / 0.5); /* semi-transparent black */\n}',
    bullets: [
      'hsl() makes it easy to create color scales — just adjust lightness.',
      'oklch() gives more perceptually uniform color manipulation in modern browsers.',
      'Always check contrast ratios for accessibility (minimum 4.5:1 for normal text).'
    ],
    references: [
      { label: 'MDN – color values', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value' }
    ]
  },
 
  // ─── BACKGROUNDS ─────────────────────────────────────────────────────────────
  {
    question: 'How do CSS backgrounds work?',
    answer:
      'The background shorthand combines background-color, background-image, background-repeat, background-position, background-size, and background-attachment. You can layer multiple background images by comma-separating values.',
    snippet:
      '.hero {\n  background:\n    linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),\n    url("photo.jpg") center/cover no-repeat;\n}\n\n.pattern {\n  background-color: #f0f0f0;\n  background-image: radial-gradient(circle, #ccc 1px, transparent 1px);\n  background-size: 20px 20px;\n}',
    bullets: [
      'background-size: cover scales the image to fill; contain fits it inside.',
      'background-attachment: fixed creates a parallax-like effect.',
      'Multiple backgrounds are painted from top to bottom — first listed is on top.'
    ],
    references: [
      { label: 'MDN – background', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/background' }
    ]
  },
 
  // ─── RESPONSIVE ──────────────────────────────────────────────────────────────
  {
    question: 'What are media queries and how do you use them?',
    answer:
      'Media queries apply CSS rules only when certain conditions are met — typically screen width. They are the foundation of responsive design. Use min-width for a mobile-first approach (styles apply from that width upward).',
    snippet:
      '/* Mobile-first: base styles apply to all sizes */\n.container { padding: 1rem; }\n\n/* Tablet and up */\n@media (min-width: 768px) {\n  .container { padding: 2rem; }\n}\n\n/* Desktop and up */\n@media (min-width: 1024px) {\n  .container {\n    max-width: 1200px;\n    margin: 0 auto;\n  }\n}\n\n/* Prefer reduced motion */\n@media (prefers-reduced-motion: reduce) {\n  * { animation: none !important; }\n}',
    bullets: [
      'Mobile-first (min-width) is preferred — it avoids overriding complex desktop styles.',
      'Use prefers-color-scheme for automatic dark/light mode.',
      'prefers-reduced-motion is an accessibility media query — always respect it.'
    ],
    references: [
      { label: 'MDN – Media Queries', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries' }
    ]
  },
  {
    question: 'What are CSS viewport units?',
    answer:
      'Viewport units are relative to the browser window size. vw = 1% of viewport width. vh = 1% of viewport height. vmin/vmax use the smaller/larger of the two. The newer svh/dvh/lvh units handle mobile browser UI bars more predictably.',
    snippet:
      '.hero { height: 100vh; }         /* full viewport height */\n.sidebar { width: 25vw; }         /* quarter of viewport width */\n.text { font-size: clamp(1rem, 2.5vw, 2rem); } /* fluid type */\n\n/* Mobile-safe full height (excludes browser UI bars) */\n.screen { height: 100dvh; }',
    bullets: [
      '100vh on mobile includes the browser address bar — use 100dvh to exclude it.',
      'svh = small viewport height (address bar visible), lvh = large (hidden), dvh = dynamic.',
      'Viewport units are great for full-screen sections without JavaScript.'
    ],
    references: [
      { label: 'MDN – Viewport units', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/length#relative_length_units_based_on_viewport' }
    ]
  },
 
  // ─── CSS VARIABLES ───────────────────────────────────────────────────────────
  {
    question: 'What are CSS custom properties (variables)?',
    answer:
      'CSS custom properties (--name: value) let you store values and reuse them with var(). They cascade and can be overridden in nested scopes, making them perfect for theming. Unlike preprocessor variables (Sass), they are live — JavaScript can read and change them at runtime.',
    snippet:
      ':root {\n  --color-primary: #6366f1;\n  --spacing-md: 1rem;\n  --radius: 0.5rem;\n}\n\n.button {\n  background: var(--color-primary);\n  padding: var(--spacing-md);\n  border-radius: var(--radius);\n}\n\n/* Dark mode override */\n[data-theme="dark"] {\n  --color-primary: #818cf8;\n}',
    bullets: [
      'Custom properties are inherited — define them on :root for global access.',
      'Use var(--color, fallback) to provide a fallback value.',
      'JavaScript: el.style.setProperty("--color", "#fff") to update at runtime.'
    ],
    references: [
      { label: 'MDN – Custom Properties', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties' }
    ]
  },
 
  // ─── TRANSITIONS & ANIMATIONS ────────────────────────────────────────────────
  {
    question: 'How do CSS transitions work?',
    answer:
      'A CSS transition smoothly animates a property from its old value to its new value over a set duration. You define which property to animate, how long it takes, the easing curve, and an optional delay.',
    snippet:
      '.button {\n  background: #6366f1;\n  transform: scale(1);\n  transition:\n    background 200ms ease,\n    transform  150ms ease-out;\n}\n\n.button:hover {\n  background: #4f46e5;\n  transform: scale(1.05);\n}',
    bullets: [
      'Only transition properties that the browser can interpolate (color, opacity, transform, etc.).',
      'Avoid transitioning width/height — transition max-height or transform: scaleY instead.',
      'Use transition: all sparingly — it can trigger unintended animations.'
    ],
    references: [
      { label: 'MDN – transition', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/transition' }
    ]
  },
  {
    question: 'How do CSS animations (@keyframes) work?',
    answer:
      'CSS animations use @keyframes to define a sequence of states, then animation to apply them to an element. Unlike transitions, animations can run automatically, loop, alternate, and have multiple intermediate steps.',
    snippet:
      '@keyframes fadeSlideIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n\n.card {\n  animation:\n    fadeSlideIn           /* keyframe name */\n    0.4s                  /* duration */\n    ease-out              /* easing */\n    0.1s                  /* delay */\n    1                     /* iteration count */\n    forwards;             /* keep final state */\n}',
    bullets: [
      'animation-fill-mode: forwards keeps the final keyframe state after the animation ends.',
      'animation-iteration-count: infinite creates a looping animation.',
      'Always provide a prefers-reduced-motion override for accessibility.'
    ],
    references: [
      { label: 'MDN – @keyframes', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes' }
    ]
  },
  {
    question: 'What is the transform property and what can it do?',
    answer:
      'transform applies 2D and 3D visual transformations without affecting layout flow. Common functions: translate() (move), scale() (resize), rotate() (spin), skew() (shear). Transforms are composited by the GPU, making them the most performant way to animate.',
    snippet:
      '.card:hover {\n  transform: translateY(-8px) scale(1.02);\n}\n\n.spinner {\n  animation: spin 1s linear infinite;\n}\n@keyframes spin {\n  to { transform: rotate(360deg); }\n}\n\n/* 3D flip */\n.flip {\n  transform: perspective(600px) rotateY(180deg);\n}',
    bullets: [
      'Multiple transform functions in one declaration: transform: rotate(45deg) scale(1.2).',
      'transform does not affect other elements\' positions — it is purely visual.',
      'will-change: transform hints the browser to promote the element to its own GPU layer.'
    ],
    references: [
      { label: 'MDN – transform', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/transform' }
    ]
  },
 
  // ─── PSEUDO-CLASSES & PSEUDO-ELEMENTS ────────────────────────────────────────
  {
    question: 'What are pseudo-classes in CSS?',
    answer:
      'Pseudo-classes target elements based on their state or position in the DOM without adding extra classes. Common ones: :hover, :focus, :active, :visited, :checked, :disabled, :nth-child(), :not(), :is(), :where().',
    snippet:
      'a:hover  { color: #818cf8; }\ninput:focus { outline: 2px solid #6366f1; }\nli:nth-child(odd) { background: #f9f9f9; }\n\n/* :is() groups selectors (reduces repetition) */\n:is(h1, h2, h3):hover { color: tomato; }\n\n/* :not() excludes elements */\nbutton:not(:disabled) { cursor: pointer; }',
    bullets: [
      ':is() and :where() simplify grouping selectors; :where() has zero specificity.',
      ':focus-visible applies focus styles only for keyboard users — better than removing :focus entirely.',
      ':nth-child(2n+1) selects odd children; :nth-child(3n) selects every third.'
    ],
    references: [
      { label: 'MDN – Pseudo-classes', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes' }
    ]
  },
  {
    question: 'What are pseudo-elements in CSS?',
    answer:
      'Pseudo-elements style specific parts of an element. ::before and ::after inject virtual content before/after the element\'s content. ::placeholder, ::selection, ::first-line, and ::first-letter target other parts.',
    snippet:
      '/* Decorative divider using ::before */\n.section-title::before {\n  content: "";\n  display: block;\n  width: 3rem;\n  height: 3px;\n  background: #6366f1;\n  margin-bottom: 0.5rem;\n}\n\n/* Custom text selection color */\n::selection {\n  background: #6366f1;\n  color: #fff;\n}\n\ninput::placeholder { color: #9ca3af; }',
    bullets: [
      '::before and ::after require content: "" to render — even if empty.',
      'They are inline by default; add display: block to use width/height.',
      'Use them for decorative UI so screen readers ignore them.'
    ],
    references: [
      { label: 'MDN – Pseudo-elements', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements' }
    ]
  },
 
  // ─── OVERFLOW & VISIBILITY ───────────────────────────────────────────────────
  {
    question: 'How does the overflow property work?',
    answer:
      'overflow controls what happens when content is larger than its container. visible (default) lets content overflow. hidden clips it. scroll always shows scrollbars. auto shows scrollbars only when needed.',
    snippet:
      '.card {\n  height: 200px;\n  overflow: hidden;    /* clip overflowing content */\n}\n\n.code-block {\n  overflow-x: auto;    /* horizontal scroll only */\n  overflow-y: hidden;\n}\n\n/* Truncate text with ellipsis */\n.label {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}',
    bullets: [
      'overflow: hidden also creates a new block formatting context — useful for clearing floats.',
      'text-overflow: ellipsis requires white-space: nowrap and overflow: hidden to work.',
      'overflow: clip is like hidden but also prevents programmatic scrolling.'
    ],
    references: [
      { label: 'MDN – overflow', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow' }
    ]
  },
 
  // ─── Z-INDEX & STACKING ──────────────────────────────────────────────────────
  {
    question: 'How does z-index and stacking context work?',
    answer:
      'z-index controls the stacking order of overlapping elements. Higher values appear on top. z-index only works on positioned elements (position other than static) or flex/grid children. Certain CSS properties (transform, opacity < 1, filter, isolation) create a new stacking context, limiting z-index to within that context.',
    snippet:
      '.modal-overlay {\n  position: fixed;\n  z-index: 1000;\n}\n\n.tooltip {\n  position: absolute;\n  z-index: 50;\n}\n\n/* isolation: isolate creates a new stacking context */\n/* without requiring position */\n.card {\n  isolation: isolate;\n}',
    bullets: [
      'A child can never appear above a parent\'s sibling if the parent has a lower z-index.',
      'Use a design token scale for z-index (e.g. --z-modal: 1000) to avoid conflicts.',
      'isolation: isolate is the cleanest way to create a stacking context without side effects.'
    ],
    references: [
      { label: 'MDN – z-index', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/z-index' }
    ]
  },
 
  // ─── MODERN CSS ──────────────────────────────────────────────────────────────
  {
    question: 'What is the CSS :has() selector?',
    answer:
      ':has() is a parent selector — it matches an element if it contains a matching descendant. It is one of the most powerful additions to CSS selectors and is now supported in all modern browsers.',
    snippet:
      '/* Style a card that contains an image */\n.card:has(img) { padding: 0; }\n\n/* Style a label next to a checked checkbox */\n.form-row:has(input:checked) label {\n  color: green;\n  font-weight: bold;\n}\n\n/* Style a nav that has a dropdown open */\nnav:has(.dropdown:hover) { background: #111; }',
    bullets: [
      ':has() enables conditional styling that previously required JavaScript.',
      'Specificity: :has() takes the specificity of the most specific selector inside it.',
      'Supported in Chrome 105+, Safari 15.4+, Firefox 121+.'
    ],
    references: [
      { label: 'MDN – :has()', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/:has' }
    ]
  },
  {
    question: 'What is CSS nesting?',
    answer:
      'Native CSS nesting (now in all modern browsers) lets you write nested rules inside a parent selector — similar to Sass. Child rules use & to reference the parent. This keeps related styles together and reduces repetition.',
    snippet:
      '.card {\n  padding: 1rem;\n  border-radius: 0.5rem;\n\n  & h2 {\n    font-size: 1.5rem; /* .card h2 */\n  }\n\n  &:hover {\n    box-shadow: 0 8px 24px rgb(0 0 0 / 0.12); /* .card:hover */\n  }\n\n  & .badge {\n    background: #6366f1; /* .card .badge */\n  }\n}',
    bullets: [
      'The & represents the parent selector in nested rules.',
      'Native nesting is now supported without Sass/PostCSS in modern browsers.',
      'Avoid deep nesting (more than 3 levels) — it increases specificity and harms readability.'
    ],
    references: [
      { label: 'MDN – CSS Nesting', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting' }
    ]
  },
  {
    question: 'What is the CSS container query?',
    answer:
      'Container queries let elements respond to the size of their parent container rather than the viewport. This makes truly reusable components that adapt to wherever they are placed — not just to screen size.',
    snippet:
      '.card-wrapper {\n  container-type: inline-size;\n  container-name: card;\n}\n\n@container card (min-width: 400px) {\n  .card {\n    display: grid;\n    grid-template-columns: 1fr 2fr;\n  }\n}',
    bullets: [
      'container-type: inline-size enables width-based queries.',
      'Great for sidebar cards that need to be compact in narrow layouts and full in wide ones.',
      'Supported in all modern browsers since 2023.'
    ],
    references: [
      { label: 'MDN – Container Queries', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries' }
    ]
  },
  {
    question: 'What is the CSS clamp() function?',
    answer:
      'clamp(min, preferred, max) returns the preferred value clamped between a minimum and maximum. It is widely used for fluid typography and spacing that scales smoothly with the viewport without media queries.',
    snippet:
      'h1 {\n  /* minimum 1.5rem, ideal 4vw, maximum 3rem */\n  font-size: clamp(1.5rem, 4vw, 3rem);\n}\n\n.container {\n  padding-inline: clamp(1rem, 5vw, 4rem);\n  max-width: clamp(320px, 90vw, 1200px);\n}',
    bullets: [
      'The preferred value is usually a viewport unit (vw) so it scales with screen size.',
      'clamp() replaces three separate media query breakpoints for typography.',
      'Also works for widths, heights, gaps, and padding.'
    ],
    references: [
      { label: 'MDN – clamp()', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/clamp' }
    ]
  },
 
  // ─── BEST PRACTICES ──────────────────────────────────────────────────────────
  {
    question: 'What is a CSS reset and why use one?',
    answer:
      'A CSS reset removes or normalizes inconsistent browser default styles so you start from a predictable baseline. Modern resets (like Josh Comeau\'s or Andy Bell\'s) are minimal — they fix specific pain points rather than zeroing everything out.',
    snippet:
      '/* Modern minimal reset */\n*, *::before, *::after { box-sizing: border-box; }\n* { margin: 0; }\nbody { line-height: 1.5; -webkit-font-smoothing: antialiased; }\nimg, video, svg { display: block; max-width: 100%; }\ninput, button, textarea, select { font: inherit; }\np, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }',
    bullets: [
      'normalize.css preserves useful browser defaults while fixing bugs.',
      'font: inherit on form elements ensures they use your chosen font.',
      'max-width: 100% on images prevents them from overflowing containers.'
    ],
    references: [
      { label: 'Josh Comeau – CSS Reset', url: 'https://www.joshwcomeau.com/css/custom-css-reset/' }
    ]
  },
  {
    question: 'What is the BEM naming convention?',
    answer:
      'BEM (Block Element Modifier) is a CSS class naming methodology. A Block is a standalone component (.card). An Element is a part of a block (.card__title). A Modifier is a variant (.card--featured). It makes CSS intent clear and reduces specificity conflicts.',
    snippet:
      '/* Block */\n.card { }\n\n/* Elements — part of the block */\n.card__image { }\n.card__title { }\n.card__body  { }\n\n/* Modifiers — variant of the block */\n.card--featured { border-color: gold; }\n.card--compact  { padding: 0.5rem; }',
    bullets: [
      'BEM keeps all selectors at a single class level — avoids specificity wars.',
      'You don\'t have to use BEM strictly; the key principle is flat, descriptive class names.',
      'Tailwind CSS is a utility-first alternative to BEM — different approach, same problem solved.'
    ],
    references: [
      { label: 'BEM Docs', url: 'https://getbem.com/introduction/' }
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

// Handle hash navigation to scroll to specific lesson
import { onMount } from 'svelte';

// Function to scroll to a lesson by ID
function scrollToLesson(lessonId: string) {
  if (typeof window === 'undefined') return;
  const match = lessonId.match(/^lesson-(\d+)$/);
  if (match) {
    const lessonIndex = parseInt(match[1]);
    // Calculate which page this lesson is on
    const targetPage = Math.floor(lessonIndex / LESSONS_PER_PAGE) + 1;
    if (targetPage !== currentPage) {
      goToPage(targetPage);
      // Wait for page change, then scroll
      setTimeout(() => {
        scrollToLessonElement(lessonId);
      }, 500);
    } else {
      // Same page, scroll immediately
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
      setTimeout(() => {
        element.classList.remove('search-highlight');
      }, 2000);
    } else {
      // If element not found, try again after a longer delay (might still be rendering)
      setTimeout(() => {
        const retryElement = document.getElementById(lessonId);
        if (retryElement) {
          retryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          retryElement.classList.add('search-highlight');
          setTimeout(() => {
            retryElement.classList.remove('search-highlight');
          }, 2000);
        }
      }, 500);
    }
  }, 100);
}

onMount(() => {
  if (typeof window === 'undefined') return;
  
  // Check initial hash
  const initialHash = window.location.hash;
  if (initialHash) {
    scrollToLesson(initialHash.substring(1));
  }
  
  // Listen for hash changes (when navigating within the same page)
  function handleHashChange() {
    const hash = window.location.hash;
    if (hash) {
      scrollToLesson(hash.substring(1));
    }
  }
  
  window.addEventListener('hashchange', handleHashChange);
  
  return () => {
    window.removeEventListener('hashchange', handleHashChange);
  };
});

// Aggregate all lessons for search
const allLessonsForSearch = [
  { category: 'CSS', path: '/learn/css', lessons: cssLessons }
];
</script>

<div class="min-h-screen text-white font-medium relative dashboard-bg" style="background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%); overflow: visible; font-family: poppins;">
    <!-- Animated gradient overlay -->
    <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
    <!-- Subtle dot pattern -->
    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>
  <DashboardHeader title="Learn CSS" user={data.user || undefined} pageName="Learn" />
  <MiniHeader />
  
  <div class="max-w-6xl mx-auto px-4 pt-6">
    <SearchComponent allLessons={allLessonsForSearch} />
  </div>

  <section class="max-w-6xl mx-auto px-4 py-10 space-y-10">
    <div class="rounded-3xl border border-white/15 bg-[#090303]/70 p-8 shadow-2xl backdrop-blur">
      <div class="flex flex-col gap-8 lg:flex-row">
        <div class="flex-1 space-y-4">
          <div class="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
            <span>CSS Introduction</span>
            <span class="h-3 w-px bg-amber-400/50"></span>
            <span>Last Updated · {lastUpdated}</span>
          </div>
          <h1 class="text-4xl font-semibold text-white">Style the Web with CSS</h1>
          <p class="text-white/80">
            CSS (Cascading Style Sheets) is the language for describing the presentation of web pages. Master selectors, properties, and the cascade to build beautiful, responsive layouts.
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
              <p class="mt-2 text-xl font-semibold text-amber-100">Style Sheet · Declarative</p>
            </div>
            <div class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold">Primary Job</p>
              <p class="mt-2 text-xl font-semibold text-amber-100">Visual Design</p>
            </div>
            <div class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold">Best Combo</p>
              <p class="mt-2 text-xl font-semibold text-amber-100">HTML + JS</p>
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
        <div class="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-black/60 to-amber-950/20 p-6 shadow-lg backdrop-blur hover:border-amber-400/60 transition">
          <p class="text-xs uppercase tracking-[0.35em] text-amber-300 font-semibold">{card.title}</p>
          <p class="mt-3 text-white/85">{card.description}</p>
          <p class="mt-4 rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-200 border border-amber-500/30">{card.highlight}</p>
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

.search-highlight {
    animation: highlightPulse 2s ease-in-out;
    border-color: rgba(251, 191, 36, 0.6) !important;
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.3) !important;
}

@keyframes highlightPulse {
    0%, 100% {
        border-color: rgba(251, 191, 36, 0.6);
        box-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
    }
    50% {
        border-color: rgba(251, 191, 36, 0.9);
        box-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
    }
}
</style>
<script lang="ts">
import DashboardHeader from '$lib/DashboardHeader.svelte';
import MiniHeader from '../MiniHeader.svelte';
import SearchComponent from '../SearchComponent.svelte';

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

const advJsLessons: QuestionBlock[] = [
  {
    question: 'What is a closure in JavaScript?',
    answer:
      'A closure is a function that retains access to its lexical scope even after the outer function has finished executing. The inner function "closes over" the variables of its parent scope.',
    snippet:
      'function outer() {\n  let x = 10;\n  return function() { return x; };\n}\nconst getX = outer();\ngetX(); // 10  — x is still accessible',
    bullets: [
      'Closures capture the variable binding, not the value at the time of creation.',
      'Useful for data privacy: variables inside a closure cannot be accessed from outside.',
      'Common in callbacks, event handlers, and module patterns.'
    ],
    references: [
      { label: 'MDN – Closures', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures' }
    ]
  },
  {
    question: 'What is the difference between var, let, and const?',
    answer:
      'var is function-scoped and hoisted with an initial value of undefined. let and const are block-scoped and hoisted but not initialised (Temporal Dead Zone). const additionally prevents reassignment of the binding.',
    snippet:
      'var a = 1;   // function-scoped, hoisted\nlet b = 2;   // block-scoped, TDZ before declaration\nconst c = 3; // block-scoped, cannot reassign\n\nif (true) {\n  let b = 99; // different b — does not leak out\n}',
    bullets: [
      'Prefer const by default; use let when you need to reassign.',
      'var in loops can cause bugs because all iterations share the same binding.',
      'Use let in for-loops so each iteration gets its own binding.'
    ],
    references: [
      { label: 'MDN – var / let / const', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let' }
    ]
  },
  {
    question: 'What is the Temporal Dead Zone (TDZ)?',
    answer:
      'The TDZ is the period between entering a block scope and the let/const declaration being evaluated. Accessing the variable in this window throws a ReferenceError, unlike var which returns undefined.',
    snippet:
      'console.log(x); // ReferenceError — TDZ\nlet x = 5;\nconsole.log(x); // 5',
    bullets: [
      'The TDZ exists to catch use-before-declare bugs that var silently ignores.',
      'Class declarations are also subject to the TDZ.'
    ],
    references: [
      { label: 'MDN – Temporal Dead Zone', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz' }
    ]
  },
 
  // ─── FUNCTIONS & EXECUTION ──────────────────────────────────────────────────
  {
    question: 'What is hoisting?',
    answer:
      'Hoisting is the engine moving declarations to the top of their scope before code runs. Function declarations are fully hoisted (name + body). var declarations are hoisted but set to undefined. let/const are hoisted but stay in the TDZ.',
    snippet:
      'greet(); // "Hello" — works because function declaration is fully hoisted\nfunction greet() { console.log("Hello"); }\n\nconsole.log(n); // undefined — var is hoisted but not initialised\nvar n = 42;',
    bullets: [
      'Function expressions (const fn = function(){}) are NOT hoisted — only the var binding is.',
      'Arrow functions assigned to variables behave the same as function expressions.'
    ],
    references: [
      { label: 'MDN – Hoisting', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Hoisting' }
    ]
  },
  {
    question: 'How does the call stack and event loop work?',
    answer:
      'JavaScript is single-threaded. The call stack tracks function execution. Web APIs (setTimeout, fetch) run outside the stack. When they finish, their callbacks are queued in the task queue (macrotasks) or microtask queue. The event loop pushes items from these queues onto the stack only when the stack is empty. Microtasks (Promises) are drained before the next macrotask.',
    snippet:
      'console.log("1");\nsetTimeout(() => console.log("3"), 0);\nPromise.resolve().then(() => console.log("2"));\n// Output: 1, 2, 3\n// Promise (.then) is a microtask — runs before setTimeout (macrotask)',
    bullets: [
      'Microtask queue: Promise callbacks, queueMicrotask(), MutationObserver.',
      'Macrotask queue: setTimeout, setInterval, I/O, UI rendering.',
      'Never block the call stack with heavy sync work — it freezes the UI.'
    ],
    references: [
      { label: 'MDN – Event Loop', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop' }
    ]
  },
  {
    question: 'What is a pure function and why does it matter?',
    answer:
      'A pure function always returns the same output for the same input and has no side effects (no mutation of external state, no I/O). Pure functions are predictable, easy to test, and safe to memoize.',
    snippet:
      '// Pure\nconst add = (a, b) => a + b;\n\n// Impure — mutates external state\nlet total = 0;\nconst addToTotal = n => { total += n; };\n\n// Impure — different output each call\nconst now = () => Date.now();',
    bullets: [
      'Prefer pure functions for business logic; isolate side effects at the boundaries.',
      'React and functional libraries (Redux reducers) rely heavily on purity.'
    ],
    references: [
      { label: 'Wikipedia – Pure Function', url: 'https://en.wikipedia.org/wiki/Pure_function' }
    ]
  },
 
  // ─── THIS & BINDING ─────────────────────────────────────────────────────────
  {
    question: 'How does "this" work in JavaScript?',
    answer:
      'The value of this depends on how a function is called, not where it is defined. In a method call, this is the object. In a plain function call (non-strict), it is the global object; in strict mode it is undefined. Arrow functions have no own this — they inherit from the enclosing lexical scope.',
    snippet:
      'const obj = {\n  name: "JS",\n  regular() { return this.name; },      // "JS"\n  arrow: () => this?.name ?? "undefined" // inherits outer this\n};\n\nconst fn = obj.regular;\nfn(); // undefined (strict) or global',
    bullets: [
      'Use .bind(), .call(), or .apply() to explicitly set this.',
      'Arrow functions are ideal for callbacks inside methods to preserve this.',
      'Class methods lose this when destructured — bind in the constructor or use arrow class fields.'
    ],
    references: [
      { label: 'MDN – this', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this' }
    ]
  },
 
  // ─── PROTOTYPES & OOP ───────────────────────────────────────────────────────
  {
    question: 'What is prototypal inheritance?',
    answer:
      'Every JavaScript object has an internal [[Prototype]] link to another object. When you access a property, JS walks the prototype chain until it finds it or reaches null. ES6 class syntax is syntactic sugar over this mechanism.',
    snippet:
      'function Animal(name) { this.name = name; }\nAnimal.prototype.speak = function() { return `${this.name} speaks`; };\n\nconst dog = new Animal("Rex");\ndog.speak(); // "Rex speaks"\n\n// ES6 equivalent\nclass Animal {\n  constructor(name) { this.name = name; }\n  speak() { return `${this.name} speaks`; }\n}',
    bullets: [
      'Object.create(proto) sets the prototype directly.',
      'Use Object.getPrototypeOf(obj) to inspect the chain — avoid __proto__.',
      'hasOwnProperty() checks only own properties, not inherited ones.'
    ],
    references: [
      { label: 'MDN – Prototype Chain', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain' }
    ]
  },
  {
    question: 'What is the difference between class and function constructors?',
    answer:
      'ES6 classes are syntax sugar over constructor functions and prototypes. Key differences: classes must be called with new (enforced at runtime), class bodies run in strict mode, and method definitions on the class are non-enumerable.',
    snippet:
      'class Person {\n  #age; // private field (ES2022)\n  constructor(name, age) {\n    this.name = name;\n    this.#age = age;\n  }\n  getAge() { return this.#age; }\n  static create(n, a) { return new Person(n, a); }\n}\n\nconst p = Person.create("Alice", 30);\np.getAge(); // 30',
    bullets: [
      'Private fields (#field) are truly private — not accessible outside the class.',
      'static methods live on the class itself, not on instances.',
      'Use extends and super() for inheritance.'
    ],
    references: [
      { label: 'MDN – Classes', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes' }
    ]
  },
 
  // ─── ASYNC ─────────────────────────────────────────────────────────────────
  {
    question: 'How does async/await work?',
    answer:
      'async/await is syntactic sugar over Promises. An async function always returns a Promise. await suspends execution of that function until the awaited Promise settles, without blocking the thread.',
    snippet:
      'async function fetchData(url) {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  return res.json();\n}\n\n// Calling it\nfetchData("/api/data")\n  .then(data => console.log(data))\n  .catch(err => console.error(err));',
    bullets: [
      'Always wrap await calls in try/catch — unhandled rejections crash Node and warn in browsers.',
      'Top-level await is supported in ES modules.',
      'await only pauses the current async function, not the whole event loop.'
    ],
    references: [
      { label: 'MDN – async/await', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function' }
    ]
  },
  {
    question: 'What are Promises and how do you chain them?',
    answer:
      'A Promise represents a future value. It is in one of three states: pending, fulfilled, or rejected. .then() handles fulfillment, .catch() handles rejection, and .finally() runs regardless.',
    snippet:
      'fetch("/api")\n  .then(res => res.json())\n  .then(data => process(data))\n  .catch(err => console.error(err))\n  .finally(() => setLoading(false));\n\n// Create your own\nconst wait = ms => new Promise(resolve => setTimeout(resolve, ms));\nawait wait(1000); // pause 1 second',
    bullets: [
      '.then() returns a new Promise — the chain continues with whatever you return.',
      'Throw inside .then() sends the rejection to the nearest .catch().',
      'Never swallow errors with an empty .catch(() => {}).'
    ],
    references: [
      { label: 'MDN – Promise', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise' }
    ]
  },
  {
    question: 'What is Promise.all, Promise.race, Promise.allSettled, and Promise.any?',
    answer:
      'These static methods handle multiple Promises at once. all waits for all to fulfill (rejects on first failure). race resolves/rejects as soon as any one settles. allSettled waits for all to settle regardless of outcome. any fulfills on the first success (rejects if all fail).',
    snippet:
      'const [user, posts] = await Promise.all([\n  fetch("/api/user").then(r => r.json()),\n  fetch("/api/posts").then(r => r.json())\n]);\n\n// allSettled — see both outcomes\nconst results = await Promise.allSettled([p1, p2]);\nresults.forEach(r => {\n  if (r.status === "fulfilled") use(r.value);\n  else log(r.reason);\n});',
    bullets: [
      'Use Promise.all when all results are required and a single failure should abort.',
      'Use Promise.allSettled when you want every result regardless of failures.',
      'Promise.any is useful for "first available" patterns like trying multiple CDNs.'
    ],
    references: [
      { label: 'MDN – Promise.all', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all' }
    ]
  },
  {
    question: 'What are generators and when should you use them?',
    answer:
      'A generator is a function that can pause execution and resume later using yield. It returns an iterator. Generators are useful for lazy sequences, infinite data streams, and implementing custom iteration.',
    snippet:
      'function* range(start, end) {\n  for (let i = start; i <= end; i++) yield i;\n}\n\nfor (const n of range(1, 5)) console.log(n); // 1 2 3 4 5\n\n// Infinite sequence\nfunction* ids() {\n  let id = 1;\n  while (true) yield id++;\n}\nconst gen = ids();\ngen.next().value; // 1\ngen.next().value; // 2',
    bullets: [
      'yield pauses the function and returns a value to the caller.',
      'next() resumes from the last yield point.',
      'Generators underpin async/await internally in transpilers.'
    ],
    references: [
      { label: 'MDN – Generator', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator' }
    ]
  },
 
  // ─── ES6+ FEATURES ──────────────────────────────────────────────────────────
  {
    question: 'What is destructuring and how does it work?',
    answer:
      'Destructuring extracts values from arrays or properties from objects into distinct variables using a pattern syntax. It works on any iterable for arrays and any object for object destructuring.',
    snippet:
      '// Object destructuring with rename + default\nconst { name: firstName = "Anonymous", age } = user;\n\n// Array destructuring\nconst [first, , third] = [1, 2, 3]; // skip index 1\n\n// Nested\nconst { address: { city } } = { address: { city: "Manila" } };\n\n// In function params\nfunction greet({ name, role = "user" }) {\n  return `Hello ${name} (${role})`;\n}',
    bullets: [
      'Use rest syntax (...rest) to gather remaining items.',
      'Destructuring in function params documents expected shape clearly.',
      'Default values only apply when the extracted value is undefined.'
    ],
    references: [
      { label: 'MDN – Destructuring', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment' }
    ]
  },
  {
    question: 'What are the spread and rest operators?',
    answer:
      'Both use the ... syntax. Spread expands an iterable into individual elements. Rest collects multiple elements into an array or object. Same syntax, opposite direction.',
    snippet:
      '// Spread — expand\nconst merged = { ...defaults, ...overrides };\nconst combined = [...arr1, ...arr2];\nMath.max(...[1, 5, 3]); // 5\n\n// Rest — collect\nfunction log(first, ...rest) {\n  console.log(first, rest); // rest is an array\n}\n\n// Object rest\nconst { id, ...remaining } = user; // remaining has everything except id',
    bullets: [
      'Spread creates shallow copies — nested objects are still shared references.',
      'Rest parameters replace the old arguments object.',
      'Object spread (ES2018) only copies own enumerable properties.'
    ],
    references: [
      { label: 'MDN – Spread syntax', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax' }
    ]
  },
  {
    question: 'What are JavaScript modules (import/export)?',
    answer:
      'ES Modules are the official module system. Exports define a module\'s public API; imports consume it. Modules have their own scope, run in strict mode automatically, and are executed only once regardless of how many times they are imported.',
    snippet:
      '// math.js\nexport const PI = 3.14159;\nexport function add(a, b) { return a + b; }\nexport default class Calculator { /* ... */ }\n\n// app.js\nimport Calculator, { PI, add } from "./math.js";\nimport * as math from "./math.js"; // namespace import\n\n// Dynamic import (lazy loading)\nconst { add } = await import("./math.js");',
    bullets: [
      'Default exports are unnamed; named exports keep their identifier.',
      'Dynamic import() returns a Promise — use it for code splitting.',
      'Tree-shaking (bundlers removing unused exports) only works with static imports.'
    ],
    references: [
      { label: 'MDN – ES Modules', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules' }
    ]
  },
  {
    question: 'What are Map and Set, and when should you use them over objects/arrays?',
    answer:
      'Map is a key-value store where keys can be any type (including objects). Set is a collection of unique values. Both maintain insertion order and have O(1) lookup.',
    snippet:
      'const map = new Map();\nmap.set({ id: 1 }, "object key"); // objects as keys\nmap.get(key); map.has(key); map.size;\n\nconst set = new Set([1, 2, 2, 3]); // {1, 2, 3}\nset.add(4); set.has(2); // true\n\n// Deduplicate an array\nconst unique = [...new Set(arr)];\n\n// WeakMap/WeakSet hold weak references (allow GC)\nconst cache = new WeakMap(); // key must be an object',
    bullets: [
      'Use Map over plain objects when keys are non-strings or insertion order matters.',
      'Set is the cleanest way to deduplicate arrays.',
      'WeakMap/WeakSet prevent memory leaks when storing metadata about objects.'
    ],
    references: [
      { label: 'MDN – Map', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map' }
    ]
  },
  {
    question: 'What are Symbols and what are they used for?',
    answer:
      'Symbol() creates a unique, immutable primitive. Every Symbol() call returns a different value. Symbols are primarily used as unique object property keys to avoid naming collisions, and to implement well-known protocols (Symbol.iterator, Symbol.toPrimitive, etc.).',
    snippet:
      'const id = Symbol("id");\nconst user = { [id]: 123, name: "Alice" };\nuser[id]; // 123\n\n// Symbol.iterator — make any object iterable\nclass Range {\n  constructor(start, end) { this.start = start; this.end = end; }\n  [Symbol.iterator]() {\n    let cur = this.start, end = this.end;\n    return { next: () => cur <= end ? { value: cur++, done: false } : { done: true } };\n  }\n}\nfor (const n of new Range(1, 3)) console.log(n); // 1 2 3',
    bullets: [
      'Symbol properties are skipped by JSON.stringify and for...in loops.',
      'Symbol.for("key") creates a global registry Symbol — same key = same Symbol.',
      'Well-known symbols let you hook into JS engine behaviours.'
    ],
    references: [
      { label: 'MDN – Symbol', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol' }
    ]
  },
 
  // ─── FUNCTIONAL PATTERNS ────────────────────────────────────────────────────
  {
    question: 'What is currying and partial application?',
    answer:
      'Currying transforms a function with multiple parameters into a chain of functions each taking one argument. Partial application pre-fills some arguments to create a specialized function. Both enable reusable, composable logic.',
    snippet:
      '// Currying\nconst multiply = a => b => a * b;\nconst double = multiply(2); // partially applied\ndouble(5); // 10\n\n// Generic curry helper\nconst curry = fn => {\n  const arity = fn.length;\n  return function curried(...args) {\n    return args.length >= arity\n      ? fn(...args)\n      : (...more) => curried(...args, ...more);\n  };\n};',
    bullets: [
      'Currying splits the "what" from the "when" — configure once, call many times.',
      'Lodash and Ramda ship utility-belt curry implementations.',
      'Partial application via .bind(null, arg1) is the built-in version.'
    ],
    references: [
      { label: 'MDN – bind (partial application)', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind' }
    ]
  },
  {
    question: 'What is function composition?',
    answer:
      'Function composition combines two or more functions so the output of one becomes the input of the next. It enables building complex transformations from small, single-purpose functions.',
    snippet:
      'const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);\nconst pipe    = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);\n\nconst trim     = s => s.trim();\nconst toLower  = s => s.toLowerCase();\nconst slugify  = s => s.replace(/\\s+/g, "-");\n\nconst toSlug = pipe(trim, toLower, slugify);\ntoSlug("  Hello World  "); // "hello-world"',
    bullets: [
      'pipe applies functions left-to-right; compose applies right-to-left.',
      'Keep composed functions pure for predictable results.',
      'Libraries like Ramda, fp-ts, and RxJS are built on composition.'
    ],
    references: [
      { label: 'MDN – Array.reduce', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce' }
    ]
  },
  {
    question: 'What is memoization?',
    answer:
      'Memoization is an optimization technique that caches the result of a pure function call so repeated calls with the same arguments return the cached value instead of recomputing.',
    snippet:
      'function memoize(fn) {\n  const cache = new Map();\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}\n\nconst expensiveFib = memoize(n =>\n  n <= 1 ? n : expensiveFib(n - 1) + expensiveFib(n - 2)\n);',
    bullets: [
      'Only memoize pure functions — impure ones may return stale cached results.',
      'React.memo and useMemo apply the same concept at the component/hook level.',
      'Consider cache eviction for long-running processes to avoid memory leaks.'
    ],
    references: [
      { label: 'MDN – Map', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map' }
    ]
  },
 
  // ─── PATTERNS & PERFORMANCE ─────────────────────────────────────────────────
  {
    question: 'What is the Module pattern and IIFE?',
    answer:
      'An IIFE (Immediately Invoked Function Expression) is a function that runs as soon as it is defined. The Module pattern uses an IIFE to create a private scope, exposing only a public API — a precursor to ES Modules.',
    snippet:
      'const counter = (function() {\n  let _count = 0; // private\n  return {\n    increment() { _count++; },\n    decrement() { _count--; },\n    value()     { return _count; }\n  };\n})();\n\ncounter.increment();\ncounter.value(); // 1\ncounter._count;  // undefined — truly private',
    bullets: [
      'IIFEs avoid polluting the global scope — still useful in non-module scripts.',
      'ES Modules replace the need for the Module pattern in modern code.',
      'The revealing module pattern explicitly lists what is public in the return.'
    ],
    references: [
      { label: 'MDN – IIFE', url: 'https://developer.mozilla.org/en-US/docs/Glossary/IIFE' }
    ]
  },
  {
    question: 'What is debouncing and throttling?',
    answer:
      'Both limit how often a function fires. Debounce delays execution until after a pause in calls — ideal for search inputs. Throttle ensures a function runs at most once per interval — ideal for scroll and resize handlers.',
    snippet:
      '// Debounce\nfunction debounce(fn, delay) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}\n\n// Throttle\nfunction throttle(fn, interval) {\n  let last = 0;\n  return (...args) => {\n    const now = Date.now();\n    if (now - last >= interval) {\n      last = now;\n      fn(...args);\n    }\n  };\n}',
    bullets: [
      'Debounce: "wait until the user stops typing."',
      'Throttle: "run at most once every X ms."',
      'Lodash ships battle-tested debounce and throttle utilities.'
    ],
    references: [
      { label: 'CSS-Tricks – Debouncing & Throttling', url: 'https://css-tricks.com/debouncing-throttling-explained-examples/' }
    ]
  },
  {
    question: 'What is the Observer / Pub-Sub pattern?',
    answer:
      'The Observer pattern defines a one-to-many relationship: when an object (subject) changes state, all registered observers are notified. Pub-Sub decouples publishers and subscribers further via an event bus.',
    snippet:
      'class EventEmitter {\n  #listeners = new Map();\n  on(event, fn)  { (this.#listeners.get(event) ?? this.#listeners.set(event, new Set()).get(event)).add(fn); }\n  off(event, fn) { this.#listeners.get(event)?.delete(fn); }\n  emit(event, data) { this.#listeners.get(event)?.forEach(fn => fn(data)); }\n}\n\nconst bus = new EventEmitter();\nbus.on("login", user => console.log("Welcome", user.name));\nbus.emit("login", { name: "Alice" });',
    bullets: [
      'DOM events use the Observer pattern (addEventListener).',
      'Clean up listeners (removeEventListener / off) to prevent memory leaks.',
      'React state management (Zustand, Redux) is built on this pattern.'
    ],
    references: [
      { label: 'Patterns.dev – Observer', url: 'https://www.patterns.dev/vanilla/observer-pattern/' }
    ]
  },
  {
    question: 'What is a Proxy and how do you use it?',
    answer:
      'A Proxy wraps an object and intercepts fundamental operations (get, set, delete, etc.) via handler traps. It enables validation, logging, computed properties, and reactive systems.',
    snippet:
      'const validator = {\n  set(target, key, value) {\n    if (key === "age" && typeof value !== "number")\n      throw new TypeError("age must be a number");\n    target[key] = value;\n    return true;\n  }\n};\n\nconst user = new Proxy({}, validator);\nuser.age = 30;   // ok\nuser.age = "30"; // TypeError\n\n// Reflect mirrors the default behaviour\nReflect.set(target, key, value, receiver);',
    bullets: [
      'Vue 3\'s reactivity system is built on Proxy.',
      'Use Reflect.* inside traps to preserve default behaviour cleanly.',
      'Proxies cannot be transparently unwrapped — be careful with identity checks (===).'
    ],
    references: [
      { label: 'MDN – Proxy', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy' }
    ]
  },
  {
    question: 'What are WeakRef and FinalizationRegistry?',
    answer:
      'WeakRef holds a weak reference to an object — it does not prevent garbage collection. FinalizationRegistry lets you register a callback that runs after an object is GC\'d. Both are low-level tools for advanced memory management.',
    snippet:
      'let obj = { data: "big payload" };\nconst ref = new WeakRef(obj);\n\n// Later...\nconst alive = ref.deref(); // returns obj or undefined if GC\'d\nif (alive) use(alive);\n\nconst registry = new FinalizationRegistry(key => {\n  console.log(`Object with key ${key} was collected`);\n});\nregistry.register(obj, "myObject");',
    bullets: [
      'Never rely on GC timing — it is non-deterministic.',
      'Mainly useful for caches and pools where stale entries should self-clean.',
      'WeakMap/WeakSet cover most weak-reference use cases more simply.'
    ],
    references: [
      { label: 'MDN – WeakRef', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef' }
    ]
  },
 
  // ─── ERROR HANDLING ─────────────────────────────────────────────────────────
  {
    question: 'How do you handle errors in async code?',
    answer:
      'Use try/catch with async/await. For raw Promise chains, attach .catch(). Always handle errors — unhandled rejections crash Node.js processes and fire unhandledrejection events in browsers.',
    snippet:
      '// async/await\nasync function main() {\n  try {\n    const data = await fetchData();\n    process(data);\n  } catch (err) {\n    if (err instanceof NetworkError) retry();\n    else throw err; // re-throw unexpected errors\n  } finally {\n    cleanup();\n  }\n}\n\n// Global catch for missed rejections\nwindow.addEventListener("unhandledrejection", event => {\n  console.error("Unhandled:", event.reason);\n});',
    bullets: [
      'Create custom Error subclasses for domain errors (class NotFoundError extends Error).',
      're-throw errors you cannot handle — don\'t silently swallow them.',
      'finally always runs, even if you return or throw inside try/catch.'
    ],
    references: [
      { label: 'MDN – Error Handling', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#error_propagation' }
    ]
  },
 
  // ─── MODERN SYNTAX ──────────────────────────────────────────────────────────
  {
    question: 'What are optional chaining (?.) and nullish coalescing (??)?',
    answer:
      'Optional chaining (?.) short-circuits to undefined instead of throwing if a value in the chain is null or undefined. Nullish coalescing (??) returns the right-hand side only when the left is null or undefined (unlike || which also triggers on falsy values like 0 or "").',
    snippet:
      'const city = user?.address?.city; // undefined if address is null\nconst fn    = obj?.method?.();      // call only if method exists\nconst arr   = data?.items?.[0];     // safe array access\n\n// ?? vs ||\nconst port = config.port ?? 3000; // keeps 0 as a valid port\nconst name = input.name || "Guest"; // treats "" and 0 as falsy',
    bullets: [
      'Combine ?. and ?? for clean defaults: user?.settings?.theme ?? "light".',
      '??= (nullish assignment) assigns only if the left side is nullish.',
      'Never over-chain ?. — it can hide real bugs if a value should always exist.'
    ],
    references: [
      { label: 'MDN – Optional Chaining', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining' }
    ]
  },
  {
    question: 'What is the structuredClone API?',
    answer:
      'structuredClone() creates a deep clone of an object using the Structured Clone Algorithm. It handles nested objects, arrays, Maps, Sets, Dates, RegExp, and even circular references — unlike JSON.parse(JSON.stringify()) which loses non-JSON types.',
    snippet:
      'const original = {\n  date: new Date(),\n  map: new Map([[1, "a"]]),\n  nested: { arr: [1, 2, 3] }\n};\n\nconst clone = structuredClone(original);\nclone.nested.arr.push(4);\noriginal.nested.arr; // [1, 2, 3] — unaffected\n\n// JSON trick fails with:\nJSON.parse(JSON.stringify({ date: new Date() })).date; // string, not Date',
    bullets: [
      'structuredClone is built into browsers and Node 17+.',
      'It cannot clone functions, DOM nodes, or class instances with methods.',
      'For those cases, implement a custom clone or use a library like lodash.cloneDeep.'
    ],
    references: [
      { label: 'MDN – structuredClone', url: 'https://developer.mozilla.org/en-US/docs/Web/API/structuredClone' }
    ]
  },
  {
    question: 'What are ES2022+ features worth knowing?',
    answer:
      'Recent JS versions added several practical improvements: class private fields/methods (#), top-level await, Array.at(), Object.hasOwn(), error cause, and the at-a-glance .at(-1) for last-item access.',
    snippet:
      '// Private fields & methods\nclass Stack {\n  #items = [];\n  #validate(v) { if (v == null) throw Error(); }\n  push(v) { this.#validate(v); this.#items.push(v); }\n  pop()  { return this.#items.pop(); }\n}\n\n// Array.at — negative indexing\n[1, 2, 3].at(-1); // 3\n\n// Object.hasOwn (replaces hasOwnProperty)\nObject.hasOwn(user, "name");\n\n// Error cause\nthrow new Error("Failed to load", { cause: originalError });\n\n// Top-level await (in modules)\nconst config = await fetch("/config").then(r => r.json());',
    bullets: [
      'Array.at() is cleaner than arr[arr.length - 1] for last-element access.',
      'Object.hasOwn() works correctly on objects with no prototype (Object.create(null)).',
      'Error cause chains errors for better debugging — always include it when re-throwing.'
    ],
    references: [
      { label: 'MDN – Array.prototype.at()', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at' }
    ]
  }
];

// Search integration
const allLessonsForSearch = [
  { category: 'Advanced JavaScript', path: '/learn/advanced-javascript', lessons: advJsLessons }
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
      setTimeout(() => {
        scrollToLessonElement(lessonId);
      }, 500);
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
      setTimeout(() => {
        element.classList.remove('search-highlight');
      }, 2000);
    } else {
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

  const initialHash = window.location.hash;
  if (initialHash) {
    scrollToLesson(initialHash.substring(1));
  }

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
</script>

<div class="min-h-screen text-white font-medium relative dashboard-bg" style="background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%); overflow: visible; font-family: poppins;">
    <!-- Animated gradient overlay -->
    <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
    <!-- Subtle dot pattern -->
    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>
  
  <DashboardHeader title="Advanced JavaScript" user={data.user || undefined} pageName="Learn" />
  <MiniHeader />

  <!-- Search Component -->
  <div class="max-w-6xl mx-auto px-4 pt-6">
    <SearchComponent allLessons={allLessonsForSearch} />
  </div>

  <section class="max-w-6xl mx-auto px-4 py-10 space-y-10">
    <!-- Rest of your intro content remains the same -->
    <div class="rounded-3xl border border-white/15 bg-[#090303]/70 p-8 shadow-2xl backdrop-blur">
      <!-- ... existing intro card ... -->
      <div class="flex flex-col gap-8 lg:flex-row">
        <div class="flex-1 space-y-4">
          <div class="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
            <span>Advanced JS</span>
            <span class="h-3 w-px bg-amber-400/50"></span>
            <span>Last Updated · {lastUpdated}</span>
          </div>
          <h1 class="text-4xl font-semibold text-white">Master Advanced JavaScript</h1>
          <p class="text-white/80">
            Explore closures, async/await, prototypes, and the latest ES6+ features to write robust and modern JavaScript.
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
              <p class="mt-2 text-xl font-semibold text-amber-100">Advanced Logic</p>
            </div>
            <div class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
              <p class="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold">Best Combo</p>
              <p class="mt-2 text-xl font-semibold text-amber-100">HTML + CSS + JS</p>
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

    <!-- Concept cards remain unchanged -->
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
          <p class="text-xs uppercase tracking-[0.35em] text-white/60">Advanced JS Lessons</p>
          <h2 class="text-3xl font-semibold text-white">Advanced JavaScript Fundamentals</h2>
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
                      <div class={`rounded-2xl border px-4 py-3 text-sm ${callout.tone === 'warning' ? 'border-amber-400/40 bg-amber-400/10 text-amber-100' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'}`}>
                        <p class="font-semibold uppercase tracking-wide text-xs">{callout.title}</p>
                        <p class="mt-1 text-white/90">{callout.body}</p>
                      </div>
                    {/each}
                  {/if}
                  {#if block.attributes}
                    <!-- attributes block if needed -->
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
/* Your existing styles + search highlight */
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
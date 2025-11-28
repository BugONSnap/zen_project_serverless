<script lang="ts">
    import DashboardHeader from '$lib/DashboardHeader.svelte';
import MiniHeader from './MiniHeader.svelte';
    export let data: { user: { id: number; username: string; email: string } | null };

    type Reference = {
        label: string;
        url: string;
    };

    type AttributeDetail = {
        name: string;
        description: string;
        badge?: string;
    };

    type Callout = {
        title: string;
        body: string;
        tone?: 'info' | 'warning';
    };

    type QuestionBlock = {
        question: string;
        answer: string;
        snippet?: string;
        note?: string;
        attributes?: AttributeDetail[];
        callouts?: Callout[];
        bullets?: string[];
        references: Reference[];
    };

    type ConceptCard = {
        title: string;
        description: string;
        highlight: string;
    };

    const lastUpdated = '08 Nov, 2025';

    const introPoints = [
        'HTML is a markup language: it annotates content so browsers know how to render it.',
        'Structure comes from semantic tags; visual styling and interactivity come from CSS & JavaScript.',
        'Every document starts with a doctype and wraps visible content inside the `<body>`.'
    ];

    const codeSample = `&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
  &lt;head&gt;
    &lt;meta charset="UTF-8" /&gt;
    &lt;title&gt;My First Webpage&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Welcome to My Webpage&lt;/h1&gt;
    &lt;p&gt;This is my first paragraph of text!&lt;/p&gt;
  &lt;/body&gt;
&lt;/html&gt;`;

    const conceptCards: ConceptCard[] = [
        {
            title: 'Element vs Tag',
            description:
                'A tag is the literal markup (`<p>`). An element includes the opening tag, its content, and the closing tag.',
            highlight: 'Element = opening tag + content + closing tag'
        },
        {
            title: 'Attributes',
            description:
                'Attributes add metadata to elements. They live in the opening tag and follow the `name="value"` format.',
            highlight: 'Example: `<a href="/about" target="_blank">`'
        },
        {
            title: 'Void Elements',
            description:
                'Some HTML tags (like `<br>` or `<img>`) are empty—no closing tag, no inner text—yet still accept attributes.',
            highlight: 'They self-close but should still include `alt`, `src`, etc.'
        }
    ];

    const LESSONS_PER_PAGE = 30;
    let currentPage = 1;

    const fundamentals: QuestionBlock[] = [
        {
            question: 'What does HTML stand for?',
            answer: 'HTML expands to HyperText Markup Language, the core markup language that structures every web page.',
            references: [
                { label: 'MDN – Intro to HTML', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
                { label: 'GeeksforGeeks – Introduction to HTML', url: 'https://www.geeksforgeeks.org/html-introduction/' }
            ]
        },
        {
            question: 'Which tag is used to create a hyperlink in HTML?',
            answer: 'Use the anchor tag `<a>` to create hyperlinks to pages, sections, files, or external sites.',
            snippet: '&lt;a href="https://example.com"&gt;Visit Example&lt;/a&gt;',
            attributes: [
                { name: 'href', description: 'Destination URL or in-page fragment that the link should navigate to.' },
                { name: 'target', description: 'Controls where the link opens; `_blank` launches a new tab.', badge: 'Common' },
                {
                    name: 'rel',
                    description: 'Describes the relationship between the current and linked documents. Pair `_blank` with `noopener noreferrer`.'
                },
                { name: 'download', description: 'Suggests the browser download the resource instead of navigating to it.' }
            ],
            references: [
                { label: 'MDN – <a> element', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a' },
                { label: 'GFG – HTML Links', url: 'https://www.geeksforgeeks.org/html-links/' }
            ]
        },
        {
            question: 'Which attribute specifies the destination of a link in an <a> tag?',
            answer: 'The `href` (hypertext reference) attribute points the anchor to its destination URL or in-page fragment.',
            snippet: '&lt;a href="/dashboard"&gt;Back to dashboard&lt;/a&gt;',
            callouts: [
                {
                    title: 'Absolute vs relative',
                    body: 'Absolute URLs start with `http(s)://` and point to external resources, while relative URLs stay within your site tree.'
                }
            ],
            references: [
                { label: 'MDN – href', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href' },
                { label: 'GFG – Anchor tag attributes', url: 'https://www.geeksforgeeks.org/html-anchor-tag/' }
            ]
        },
        {
            question: 'Which attribute is used to provide alternative text for an image?',
            answer: 'Always add the `alt` attribute to `<img>` for accessibility; it describes the image when it cannot load.',
            snippet: '&lt;img src="/logo.png" alt="Zentry brand logo"&gt;',
            bullets: [
                'Keep alt text short (≈125 characters) but meaningful; describe the intent, not every pixel.',
                'Use empty alt text (`alt=""`) for decorative images so assistive tech skips them.',
                'Avoid keyword stuffing—search engines penalize low-quality alt copy.'
            ],
            references: [
                { label: 'MDN – <img>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img' },
                { label: 'GFG – HTML Images', url: 'https://www.geeksforgeeks.org/html-images/' }
            ]
        },
        {
            question: 'Quick! Which attribute on an anchor tag opens the link in a new browser tab?',
            answer: 'Set `target="_blank"` along with `rel="noopener noreferrer"` for security when opening a new tab.',
            snippet: '&lt;a href="https://zentry.dev" target="_blank" rel="noopener noreferrer"&gt;Docs&lt;/a&gt;',
            note: 'The rel attribute prevents the new page from gaining access to the originating window object.',
            callouts: [
                {
                    title: 'Security Tip',
                    body: 'Without `rel="noopener noreferrer"`, the newly opened page can call `window.opener` and hijack the origin tab.',
                    tone: 'warning'
                }
            ],
            references: [
                { label: 'MDN – target attribute', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-target' }
            ]
        },
        {
            question: 'What is the correct HTML element for the largest heading?',
            answer: 'Use `<h1>` for the top-level, most important heading; only one primary `<h1>` is recommended per page.',
            bullets: [
                '`<h1>` introduces the page topic; follow with `<h2>` and `<h3>` for subsections.',
                'Screen readers use heading hierarchy as a navigation outline.',
                'Style headings with CSS instead of replacing them with non-semantic `<div>` elements.'
            ],
            references: [
                { label: 'MDN – Headings', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements' }
            ]
        },
        {
            question: 'Which tag is used to define a paragraph?',
            answer: 'Wrap blocks of text content inside the `<p>` tag to create readable paragraphs.',
            snippet: '&lt;p&gt;Welcome to the Learn module.&lt;/p&gt;',
            references: [
                { label: 'MDN – <p>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/p' }
            ]
        },
        {
            question: 'What is the correct HTML for inserting a line break?',
            answer: 'Use the void element `<br>` for single line breaks inside text without starting a new paragraph.',
            references: [
                { label: 'MDN – <br>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/br' }
            ]
        },
        {
            question: 'Which HTML tag is used to create an unordered list?',
            answer: 'Use `<ul>` to start an unordered list and pair it with `<li>` items for each bullet.',
            snippet: '&lt;ul&gt;\\n  &lt;li&gt;HTML&lt;/li&gt;\\n  &lt;li&gt;CSS&lt;/li&gt;\\n&lt;/ul&gt;',
            bullets: [
                'Nest `<ul>` inside `<li>` items to represent sub points.',
                'Change marker shapes via `list-style-type` or replace them entirely with custom icons using background images.'
            ],
            references: [
                { label: 'MDN – <ul>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul' },
                { label: 'GFG – HTML Lists', url: 'https://www.geeksforgeeks.org/html-lists/' }
            ]
        },
        {
            question: 'What is the correct HTML for making a text input field?',
            answer: 'Use the `<input type="text">` control, ideally with a label for accessibility.',
            snippet: '&lt;label&gt;Username&lt;/label&gt;\\n&lt;input type="text" name="username"&gt;',
            attributes: [
                { name: 'name', description: 'Key associated with the submitted value in the form body.' },
                { name: 'placeholder', description: 'On-screen hint that disappears as the user types.' },
                { name: 'maxlength', description: 'Restricts the number of characters a user can input.' },
                { name: 'autocomplete', description: 'Instructs the browser on whether it can autofill the field.' }
            ],
            references: [
                { label: 'MDN – <input type="text">', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text' }
            ]
        },
        {
            question: 'Which tag is used to define a list item?',
            answer: 'The `<li>` tag represents each item inside ordered `<ol>` or unordered `<ul>` lists.',
            references: [
                { label: 'MDN – <li>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/li' }
            ]
        },
        {
            question: 'What is the correct HTML for creating a checkbox?',
            answer: 'Checkboxes are built with `<input type="checkbox">`; pair them with labels for clarity.',
            snippet: '&lt;label&gt;&lt;input type="checkbox" checked&gt; Subscribe&lt;/label&gt;',
            attributes: [
                { name: 'checked', description: 'Boolean attribute that marks the checkbox selected on load.' },
                { name: 'value', description: 'Payload submitted when the checkbox is ticked.' }
            ],
            references: [
                { label: 'MDN – Checkbox input', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox' }
            ]
        },
        {
            question: 'What is the correct HTML for making a radio button?',
            answer: 'Use `<input type="radio">` and share the same `name` across related options to group them.',
            snippet: '&lt;input type="radio" name="plan" value="basic"&gt; Basic',
            bullets: [
                'Each radio button in the same group must have the same `name` but unique `value`.',
                'Use `checked` to define the default selection.',
                'Wrap the input in a `<label>` so the entire text is clickable.'
            ],
            references: [
                { label: 'MDN – Radio input', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio' }
            ]
        },
        {
            question: 'Which tag is used to define bold text?',
            answer: 'Use `<strong>` for semantically important text (browsers render it bold). `<b>` is purely stylistic.',
            bullets: [
                '<strong> communicates importance to assistive technologies.',
                'Reserve `<b>` for stylistic changes that do not convey emphasis.'
            ],
            references: [
                { label: 'MDN – <strong>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/strong' }
            ]
        },
        {
            question: 'Which tag is used to define emphasized text?',
            answer: 'Use `<em>` to emphasize text (usually italicized) and to signal emphasis to screen readers.',
            bullets: [
                'Nested `<em>` tags increase the level of stress (e.g., `<em><em>really</em></em>`).',
                'Screen readers change tone on emphasized words, so do not overuse it.'
            ],
            references: [
                { label: 'MDN – <em>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/em' }
            ]
        },
        {
            question: 'What is the correct HTML element for inserting a horizontal rule?',
            answer: 'Use the void element `<hr>` to insert a thematic break between paragraph-level content.',
            snippet: '&lt;p&gt;Intro text&lt;/p&gt;\\n&lt;hr&gt;\\n&lt;p&gt;Next section&lt;/p&gt;',
            bullets: [
                '`<hr>` is self-closing and represents a shift in topic—not just a visual line.',
                'Style it with CSS (`border`, `height`, `background`) for custom separators.'
            ],
            references: [
                { label: 'MDN – <hr>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/hr' }
            ]
        },
        {
            question: 'Which tag is used to define a section in a document?',
            answer: 'Use the `<section>` element to group related content with its own heading.',
            snippet: '&lt;section&gt;\\n  &lt;h2&gt;Features&lt;/h2&gt;\\n  &lt;p&gt;Details...&lt;/p&gt;\\n&lt;/section&gt;',
            bullets: [
                'Each `<section>` should contain a heading (`<h1>`–`<h6>`).',
                'Think of sections as chapters or thematic groupings.'
            ],
            references: [
                { label: 'MDN – <section>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section' }
            ]
        },
        {
            question: 'What is the correct HTML for creating a numbered list?',
            answer: 'Use `<ol>` (ordered list) with nested `<li>` items for automatically numbered content.',
            snippet: '&lt;ol&gt;\\n  &lt;li&gt;Plan&lt;/li&gt;\\n  &lt;li&gt;Build&lt;/li&gt;\\n  &lt;li&gt;Ship&lt;/li&gt;\\n&lt;/ol&gt;',
            attributes: [
                { name: 'start', description: 'Sets the starting value for the first list item (default is 1).' },
                { name: 'type', description: 'Controls numbering style (1, A, a, I, i).' },
                { name: 'reversed', description: 'Displays numbers in descending order.' }
            ],
            references: [
                { label: 'MDN – <ol>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol' }
            ]
        },
        {
            question: 'Which tag is used to define a table row?',
            answer: 'Use the `<tr>` element to wrap a single row of table header or data cells.',
            snippet: '&lt;tr&gt;\\n  &lt;td&gt;Alice&lt;/td&gt;\\n  &lt;td&gt;24&lt;/td&gt;\\n&lt;/tr&gt;',
            references: [
                { label: 'MDN – <tr>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr' }
            ]
        },
        {
            question: 'Which tag is used to define a table header cell?',
            answer: 'Use `<th>` to represent a header cell; browsers render it bold and centered by default.',
            snippet: '&lt;tr&gt;\\n  &lt;th&gt;Name&lt;/th&gt;\\n  &lt;th&gt;Score&lt;/th&gt;\\n&lt;/tr&gt;',
            attributes: [
                { name: 'scope', description: 'Indicates whether the header applies to a row, column, or group (row, col, rowgroup, colgroup).' },
                { name: 'abbr', description: 'Provides an abbreviated form for screen readers.' }
            ],
            references: [
                { label: 'MDN – <th>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th' }
            ]
        },
        {
            question: 'Which tag is used to define a footer for a document or section?',
            answer: 'Use `<footer>` to wrap supplementary info such as author, copyright, or related links at the end of a section/page.',
            snippet: '&lt;footer&gt;\\n  &lt;p&gt;&copy; 2025 Zentry&lt;/p&gt;\\n&lt;/footer&gt;',
            references: [
                { label: 'MDN – <footer>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/footer' }
            ]
        },
        {
            question: 'Which tag is used to define a navigation link section?',
            answer: 'Use `<nav>` to group primary navigation links.',
            snippet: '&lt;nav&gt;\\n  &lt;a href="/dashboard"&gt;Dashboard&lt;/a&gt;\\n  &lt;a href="/learn"&gt;Learn&lt;/a&gt;\\n&lt;/nav&gt;',
            bullets: [
                '`<nav>` should be reserved for major navigation blocks, not every list of links.'
            ],
            references: [
                { label: 'MDN – <nav>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav' }
            ]
        },
        {
            question: 'Which tag is used to display an image?',
            answer: 'Use `<img>` with `src` and `alt` attributes to embed raster images.',
            snippet: '&lt;img src="/hero.jpg" alt="Hero artwork"&gt;',
            attributes: [
                { name: 'src', description: 'Location of the image file.' },
                { name: 'alt', description: 'Text alternative describing the image content/purpose.', badge: 'Required' },
                { name: 'loading', description: 'Set to `lazy` to defer offscreen images.' }
            ],
            references: [
                { label: 'MDN – <img>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img' }
            ]
        },
        {
            question: 'What is the correct syntax for creating an HTML comment?',
            answer: 'Wrap notes inside `<!--` and `-->`; comments are ignored by the browser.',
            snippet: '&lt;!-- TODO: replace placeholder copy --&gt;',
            bullets: [
                'Avoid placing comments inside attribute values.',
                'Use comments to explain complex markup, not for secret data.'
            ],
            references: [
                { label: 'MDN – HTML comments', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/comment' }
            ]
        },
        {
            question: 'What is the correct HTML for adding a background color?',
            answer: 'Apply inline styles or, preferably, CSS classes. Inline example: `<body style="background-color:#111;">`.',
            callouts: [
                {
                    title: 'Best Practice',
                    body: 'Use CSS classes instead of inline styles for maintainability.',
                    tone: 'info'
                }
            ],
            references: [
                { label: 'MDN – Global attributes / style', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/style' }
            ]
        },
        {
            question: 'Quick! Which input type is best for uploading files in a form?',
            answer: 'Use `<input type="file">` so browsers render a file picker and include files in form submissions.',
            snippet: '&lt;input type="file" name="resume" accept=".pdf,.docx"&gt;',
            attributes: [
                { name: 'accept', description: 'Comma-separated list of allowed MIME types or file extensions.' },
                { name: 'multiple', description: 'Allows selecting more than one file.' }
            ],
            references: [
                { label: 'MDN – file input', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file' }
            ]
        },
        {
            question: 'Quick! Which input type is best for collecting a user\'s date of birth?',
            answer: 'Use `<input type="date">` to get a calendar picker, proper validation, and ISO date values.',
            snippet: '&lt;input type="date" name="dob"&gt;',
            references: [
                { label: 'MDN – date input', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date' }
            ]
        },
        {
            question: 'Quick! Which input type is best for entering a color value?',
            answer: 'Use `<input type="color">` for a native color picker that returns hex values.',
            snippet: '&lt;input type="color" name="theme" value="#50c5c1"&gt;',
            references: [
                { label: 'MDN – color input', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color' }
            ]
        },
        {
            question: 'What HTML element is used to embed a video in HTML5?',
            answer: 'Use the `<video>` element with one or more `<source>` tags and optional controls.',
            snippet: '&lt;video controls width="480"&gt;\\n  &lt;source src="/intro.mp4" type="video/mp4"&gt;\\n  Sorry, your browser doesn\'t support embedded videos.\\n&lt;/video&gt;',
            attributes: [
                { name: 'controls', description: 'Displays native play/pause UI for the user.' },
                { name: 'poster', description: 'URL of an image shown before playback starts.' },
                { name: 'autoplay', description: 'Starts playback automatically (respect user preferences).' }
            ],
            references: [
                { label: 'MDN – <video>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video' }
            ]
        },
        {
            question: 'What HTML element is used to embed audio content?',
            answer: 'Use the `<audio>` element with `<source>` children for different codecs.',
            snippet: '&lt;audio controls&gt;\\n  &lt;source src="/loop.ogg" type="audio/ogg"&gt;\\n  &lt;source src="/loop.mp3" type="audio/mpeg"&gt;\\n  Your browser does not support the audio element.\\n&lt;/audio&gt;',
            attributes: [
                { name: 'controls', description: 'Shows native audio controls (play, scrub, volume).' },
                { name: 'loop', description: 'Restarts playback automatically when the track ends.' },
                { name: 'preload', description: 'Hints how much audio should be preloaded (none, metadata, auto).' }
            ],
            references: [
                { label: 'MDN – <audio>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio' }
            ]
        },
        {
            question: 'Which tag is used to define independent, self-contained content in HTML5?',
            answer: 'Use `<article>` for standalone content such as blog entries, changelog sections, product tiles, or forum replies.',
            snippet: '&lt;article&gt;\\n  &lt;header&gt;\\n    &lt;h2&gt;Patch Notes&lt;/h2&gt;\\n    &lt;p&gt;Published by Zentry Devs&lt;/p&gt;\\n  &lt;/header&gt;\\n  &lt;p&gt;Balance changes...&lt;/p&gt;\\n&lt;/article&gt;',
            bullets: [
                'An article should make sense outside the current page—perfect for RSS feeds or embeds.',
                'You can nest `<article>` elements (e.g., comments inside a blog post).',
                'Pair `<article>` with `<header>`/`<footer>` to hold author info, share links, or tags.'
            ],
            callouts: [
                {
                    title: 'Semantic SEO',
                    body: 'Search engines treat `<article>` regions as primary content blocks, which can boost rich snippets.'
                }
            ],
            references: [
                { label: 'MDN – <article>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article' }
            ]
        },
        {
            question: 'Identify the HTML tag used to embed external content such as a YouTube video or Google content.',
            answer: 'Use `<iframe>` to embed another HTML page inside the current document while keeping it sandboxed.',
            snippet: '&lt;iframe width="560" height="315" src="https://www.youtube.com/embed/xyz" title="Zentry Trailer" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen&gt;&lt;/iframe&gt;',
            attributes: [
                { name: 'src', description: 'URL of the embedded resource (must follow provider allowlists).' },
                { name: 'allow', description: 'Grants specific capabilities such as autoplay, fullscreen, clipboard access.' },
                { name: 'loading', description: 'Use `lazy` so the iframe defers loading offscreen content.' },
                { name: 'sandbox', description: 'Restricts what the framed page can do; add tokens (`allow-same-origin`, etc.) as needed.' }
            ],
            callouts: [
                {
                    title: 'Privacy Note',
                    body: 'Embedded services can set third-party cookies—pair with consent banners if you target EU users.',
                    tone: 'warning'
                }
            ],
            references: [
                { label: 'MDN – <iframe>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe' }
            ]
        },
        {
            question: 'Which tag is used to group media content with a caption in HTML5?',
            answer: '`<figure>` keeps media (images, charts, code samples) bundled with an explanatory `<figcaption>`.',
            snippet: '&lt;figure&gt;\\n  &lt;img src="/diagram.png" alt="System diagram"&gt;\\n  &lt;figcaption&gt;Architecture flow between services A, B, and C&lt;/figcaption&gt;\\n&lt;/figure&gt;',
            bullets: [
                'Use `<figure>` when the media is referenced in the text and could be moved to an appendix without losing meaning.',
                'Only one `<figcaption>` per `<figure>`, but it can appear before or after the media.'
            ],
            references: [
                { label: 'MDN – <figure>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure' }
            ]
        },
        {
            question: 'Identify the HTML tag used to mark up a measurement within a known range.',
            answer: 'Use `<meter>` for scalar values such as health bars, rating scores, storage quotas, or temperature.',
            snippet: '&lt;meter value="0.7" min="0" max="1" high="0.85" optimum="0.5"&gt;70%&lt;/meter&gt;',
            attributes: [
                { name: 'min / max', description: 'Define the numeric boundaries of the metric.' },
                { name: 'value', description: 'Current measurement point within those bounds.' },
                { name: 'low / high / optimum', description: 'Thresholds that help assistive tech describe good vs bad ranges.' }
            ],
            bullets: [
                '`<meter>` is for static measurements; use `<progress>` for task completion.',
                'Screen readers will announce “70 percent (good)” when optimum ranges are provided.'
            ],
            references: [
                { label: 'MDN – <meter>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meter' }
            ]
        },
        {
            question: 'Identify the tag used to output the result of a calculation in a form.',
            answer: 'Use `<output>` to display computed values that stay linked to form controls.',
            snippet: '&lt;form oninput="total.value = price.value * qty.value"&gt;\\n  &lt;input id="price" type="number" value="10"&gt;\\n  &lt;input id="qty" type="number" value="3"&gt;\\n  =&amp;nbsp;&lt;output name="total" for="price qty"&gt;30&lt;/output&gt;\\n&lt;/form&gt;',
            attributes: [
                { name: 'for', description: 'Space-separated IDs of controls the output depends on.' },
                { name: 'name', description: 'Allows the calculated result to be submitted with the form.' }
            ],
            bullets: [
                'Because `<output>` is focusable, screen readers announce value changes automatically.',
                'Great for calculators, shipping estimators, and “total price” widgets.'
            ],
            references: [
                { label: 'MDN – <output>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output' }
            ]
        },
        {
            question: 'Quick! Which attribute on an input element provides a list of predefined options?',
            answer: 'Use the `list` attribute to hook an `<input>` up to a `<datalist>` of suggestions without restricting custom values.',
            snippet: '&lt;input list="langs" name="lang" placeholder="Pick a language"&gt;\\n&lt;datalist id="langs"&gt;\\n  &lt;option value="HTML"&gt;\\n  &lt;option value="CSS"&gt;\\n  &lt;option value="JavaScript"&gt;\\n&lt;/datalist&gt;',
            bullets: [
                'Unlike `<select>`, users can still type their own value.',
                'Perfect for hinting common values like tech stack, country, or IDE.',
                'Combine with `autocomplete="off"` if you only want to show custom suggestions.'
            ],
            references: [
                { label: 'MDN – list attribute', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#list' }
            ]
        },
        {
            question: 'Identify the HTML tag used to represent a self-contained sidebar in HTML5.',
            answer: 'Use `<aside>` for tangential or complementary content—related links, pull quotes, glossary entries, ads.',
            bullets: [
                'If the sidebar relates to a specific `<article>`, nest the `<aside>` inside that article; otherwise keep it at page level.',
                'Screen readers announce “complementary region,” so keep the content concise and relevant.',
                'Style it distinctively to signal that it’s supplementary.'
            ],
            references: [
                { label: 'MDN – <aside>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/aside' }
            ]
        },
        {
            question: 'Identify the HTML tag used to mark up a caption for a table.',
            answer: 'Use `<caption>` as the first descendant of `<table>` to give users a summary of what the data represents.',
            snippet: '&lt;table&gt;\\n  &lt;caption&gt;Leaderboard – November Season&lt;/caption&gt;\\n  ...\\n&lt;/table&gt;',
            bullets: [
                'Assistive tech reads the caption before navigating the table, so describe the data, not styling.',
                'Use CSS `caption-side: bottom;` when you want the caption below the table.'
            ],
            references: [
                { label: 'MDN – <caption>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption' }
            ]
        },
        {
            question: 'Quick! Which attribute on an input element makes it mandatory to fill out?',
            answer: 'Use the boolean `required` attribute so browsers prevent submission until the control has a value.',
            snippet: '&lt;input type="email" name="contact" required aria-describedby="email-tip"&gt;',
            callouts: [
                {
                    title: 'Validation UX',
                    body: 'Pair `required` with helpful hints (`aria-describedby`, helper text) so users know why the field matters.'
                }
            ],
            references: [
                { label: 'MDN – required attribute', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/required' }
            ]
        },
        {
            question: 'Which tag is used to mark up a time or date in HTML5?',
            answer: 'Use `<time>` with a machine-readable `datetime` attribute to mark events, publish dates, or durations.',
            snippet: '&lt;time datetime="2025-11-24T09:30:00-05:00"&gt;Nov 24, 2025 · 9:30 AM ET&lt;/time&gt;',
            bullets: [
                'ISO 8601 values ensure search engines and calendars parse your times correctly.',
                'Also works for durations using `PT5M` (five minutes) or `P3D` (three days).'
            ],
            references: [
                { label: 'MDN – <time>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/time' }
            ]
        },
        {
            question: 'Identify the HTML tag used to provide a visible heading for a group of form elements.',
            answer: '`<legend>` titles the controls wrapped inside a `<fieldset>`, giving screen readers context for each field.',
            snippet: '&lt;fieldset&gt;\\n  &lt;legend&gt;Contact Info&lt;/legend&gt;\\n  &lt;label&gt;Email&lt;/label&gt;\\n  &lt;input type="email"&gt;\\n  &lt;label&gt;Phone&lt;/label&gt;\\n  &lt;input type="tel"&gt;\\n&lt;/fieldset&gt;',
            bullets: [
                'Place `<legend>` as the first child to keep the markup semantic.',
                'Keep legend text concise so it doesn’t get repeated excessively by assistive tech.'
            ],
            references: [
                { label: 'MDN – <legend>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/legend' }
            ]
        },
        {
            question: 'Quick! Which tag is used to display a progress bar in HTML5?',
            answer: 'Use `<progress>` to show task completion.',
            snippet: '&lt;progress value="45" max="100"&gt;45%&lt;/progress&gt;',
            attributes: [
                { name: 'value', description: 'Current completion amount (omit for indeterminate state).' },
                { name: 'max', description: 'Total amount of work to be done (defaults to 1).' }
            ],
            bullets: [
                'Label progress bars with surrounding text or `aria-labelledby` so people know what is loading.',
                'Use CSS to style the bar, but keep sufficient color contrast for accessibility.'
            ],
            references: [
                { label: 'MDN – <progress>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress' }
            ]
        },
        {
            question: 'Identify the HTML tag used to mark up a figure caption.',
            answer: 'Use `<figcaption>` inside `<figure>` to describe the media.',
            bullets: [
                'Only one `<figcaption>` per `<figure>`; place it before or after the media.',
                'Include credit lines or source links in the caption instead of the image alt text.'
            ],
            references: [
                { label: 'MDN – <figcaption>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figcaption' }
            ]
        },
        {
            question: 'Which tag is used to mark up a highlighted or marked text in HTML5?',
            answer: 'Use `<mark>` to highlight text that is relevant to the user, such as search matches or annotations.',
            snippet: '&lt;p&gt;Remember to &lt;mark&gt;ship MVP&lt;/mark&gt; before Friday.&lt;/p&gt;',
            bullets: [
                '`<mark>` conveys “this text is highlighted in this context” rather than “make it yellow for styling.”',
                'For permanent emphasis, prefer `<strong>` or `<em>`; `<mark>` is contextual.'
            ],
            references: [
                { label: 'MDN – <mark>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark' }
            ]
        },
        {
            question: 'Quick! Which attribute on an image tag provides alternative text for accessibility?',
            answer: 'The `alt` attribute describes the image when it cannot be seen; it is required for meaningful graphics.',
            snippet: '&lt;img src="/team.jpg" alt="Zentry core team celebrating release"&gt;',
            bullets: [
                'Describe the intent of the image, not every pixel.',
                'Use empty alt text (`alt=""`) for decorative images so screen readers skip them.',
                'Never repeat surrounding captions word-for-word—keep it complementary.'
            ],
            references: [
                { label: 'MDN – Image accessibility', url: 'https://developer.mozilla.org/en-US/docs/Learn/Accessibility/HTML#images' }
            ]
        },
        {
            question: 'Identify the HTML tag used to embed SVG graphics.',
            answer: 'Use the `<svg>` element to embed vector graphics directly in the DOM (inline) or via the XML namespace.',
            snippet: '&lt;svg width="120" height="40" viewBox="0 0 120 40" role="img" aria-label="Zentry logo"&gt;\\n  &lt;text x="0" y="30"&gt;Zentry&lt;/text&gt;\\n&lt;/svg&gt;',
            attributes: [
                { name: 'viewBox', description: 'Defines the internal coordinate system so the SVG scales cleanly.' },
                { name: 'role / aria-label', description: 'Expose accessible names when the SVG conveys meaning.' }
            ],
            references: [
                { label: 'MDN – <svg>', url: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg' }
            ]
        },
        {
            question: 'Identify the attribute that associates a label with a form input.',
            answer: 'Set the `<label>` “for” attribute to the id of the corresponding form control.',
            snippet: '&lt;label for="email"&gt;Email&lt;/label&gt;\\n&lt;input id="email" type="email"&gt;',
            bullets: [
                'Clicking the label focuses the input, improving usability.',
                'Implicit labeling (wrapping the input) works too, but explicit `for`/`id` pairs allow separation for layout.'
            ],
            references: [
                { label: 'MDN – <label>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label' }
            ]
        },
        {
            question: 'Quick! Which tag is used to embed a script in HTML?',
            answer: 'Use `<script>` for inline or external JavaScript.',
            snippet: '&lt;script src="/app.js" defer&gt;&lt;/script&gt;',
            attributes: [
                { name: 'src', description: 'External script URL (omit when embedding inline code).' },
                { name: 'defer', description: 'Delays execution until after parsing is complete (for external scripts).' },
                { name: 'type', description: 'Defaults to `text/javascript`; set to `module` for ES modules.' }
            ],
            references: [
                { label: 'MDN – <script>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script' }
            ]
        },
        {
            question: 'Identify the HTML tag used for collapsible content in HTML5.',
            answer: 'Use `<details>` to wrap collapsible content and `<summary>` for the toggle label.',
            snippet: '&lt;details open&gt;\\n  &lt;summary&gt;See example&lt;/summary&gt;\\n  &lt;p&gt;Expanded details go here.&lt;/p&gt;\\n&lt;/details&gt;',
            bullets: [
                '`open` attribute keeps the panel expanded by default.',
                'Browsers provide built-in toggle behavior and keyboard support.',
                'Combine with CSS for custom disclosure icons.'
            ],
            references: [
                { label: 'MDN – <details>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details' }
            ]
        },
        {
            question: 'Quick! Which attribute on a link tag specifies the relationship between the current document and the linked resource?',
            answer: 'Use the `rel` attribute on `<a>` or `<link>` to define the relationship (e.g., `noopener`, `nofollow`, `preload`).',
            snippet: '&lt;a href="https://docs.zentry.dev" rel="noopener noreferrer" target="_blank"&gt;Docs&lt;/a&gt;',
            bullets: [
                '`rel="noopener"` protects against `window.opener` attacks when using `_blank`.',
                '`rel="nofollow"` hints search engines not to pass ranking authority.',
                'Use multiple values separated by spaces.'
            ],
            references: [
                { label: 'MDN – rel attribute', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel' }
            ]
        },
        {
            question: 'Identify the HTML tag used to define a template for client-side rendering.',
            answer: 'Use `<template>` to hold inert DOM that JavaScript can clone later.',
            snippet: '&lt;template id="card"&gt;\\n  &lt;article class="card"&gt;&lt;h3&gt;&lt;/h3&gt;&lt;p&gt;&lt;/p&gt;&lt;/article&gt;\\n&lt;/template&gt;',
            bullets: [
                'Content inside `<template>` is not rendered until cloned via JS.',
                'Access the fragment via `document.getElementById(\'card\').content` and `cloneNode(true)`.'
            ],
            references: [
                { label: 'MDN – <template>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template' }
            ]
        },
        {
            question: 'Which tag is used to provide fallback content for browsers that do not support scripts?',
            answer: 'Use `<noscript>` to show alternative markup when JavaScript is disabled or unsupported.',
            snippet: '&lt;noscript&gt;Please enable JavaScript to use the interactive playground.&lt;/noscript&gt;',
            bullets: [
                'Place `<noscript>` near critical interactive areas or inside `<head>` for analytics fallbacks.',
                'Keep the fallback concise but helpful.'
            ],
            references: [
                { label: 'MDN – <noscript>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript' }
            ]
        },
        {
            question: 'What HTML element is used to display a progress bar?',
            answer: 'Use `<progress>` for visualizing task completion; it exposes value/max semantics to assistive tech.',
            snippet: '&lt;label for="upload-progress"&gt;Uploading...&lt;/label&gt;\\n&lt;progress id="upload-progress" value="32" max="100"&gt;32%&lt;/progress&gt;',
            attributes: [
                { name: 'value', description: 'Current progress amount; omit for indeterminate loaders.' },
                { name: 'max', description: 'Total amount of work (defaults to 1).' }
            ],
            bullets: [
                'Pair with a `<label>` or `aria-labelledby` so users know what is being tracked.',
                'For fully custom bars, mirror the value into CSS while keeping the native element for accessibility.'
            ],
            references: [
                { label: 'MDN – <progress>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress' }
            ]
        },
        {
            question: 'What HTML element is used to display the result of a calculation or user action?',
            answer: 'Use `<output>` to surface computed values or live feedback tied to form controls.',
            snippet: '&lt;output id="status" role="status"&gt;Ready&lt;/output&gt;',
            bullets: [
                'Combine with `role="status"` or `aria-live="polite"` to announce updates to assistive tech.',
                'Use JavaScript to set `.value` or `.textContent` when the underlying data changes.'
            ],
            references: [
                { label: 'MDN – <output>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output' }
            ]
        },
        {
            question: 'What HTML element is used to declare fragments of HTML not rendered immediately but instantiated later in JavaScript?',
            answer: 'Again, the `<template>` element stores inert DOM that can be cloned and inserted dynamically.',
            snippet: '&lt;template id="todo-item"&gt;\\n  &lt;li class="todo"&gt;&lt;input type="checkbox"&gt;&lt;span&gt;&lt;/span&gt;&lt;/li&gt;\\n&lt;/template&gt;',
            bullets: [
                'Use `template.content.cloneNode(true)` to create instances.',
                'Great for component-like rendering without a framework.'
            ],
            references: [
                { label: 'MDN – <template> (usage)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement' }
            ]
        },
        {
            question: 'What ARIA landmark role should be used to identify the main content of a page?',
            answer: 'Use the `<main>` element (preferred) or `role="main"` on a container to denote the primary content region.',
            snippet: '&lt;main id="content" role="main"&gt;...&lt;/main&gt;',
            bullets: [
                'Only one `role="main"` region should exist per page.',
                'Screen readers offer shortcuts (e.g., NVDA’s “d”) to jump to the main region.'
            ],
            references: [
                { label: 'WAI-ARIA – Landmarks', url: 'https://www.w3.org/TR/wai-aria/#landmark_roles' }
            ]
        },
        {
            question: 'What HTML attribute allows controlling the tab order?',
            answer: 'Use the `tabindex` attribute to define custom focus order.',
            snippet: '&lt;button tabindex="1"&gt;First&lt;/button&gt;\\n&lt;button tabindex="2"&gt;Second&lt;/button&gt;',
            bullets: [
                'Avoid positive values unless absolutely necessary; rely on DOM order instead.',
                '`tabindex="-1"` removes an element from the tab order but keeps it focusable via script.',
                '`tabindex="0"` includes custom elements in the natural order.'
            ],
            references: [
                { label: 'MDN – tabindex', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex' }
            ]
        },
        {
            question: 'Identify the attribute used to provide a regular expression for input validation.',
            answer: 'Use the `pattern` attribute on `<input>`/`<textarea>` to enforce a regex match.',
            snippet: '&lt;input type="text" name="zip" pattern="\\d{5}" title="Enter a 5-digit ZIP"&gt;',
            bullets: [
                'Patterns are implicitly anchored; no need for ^ and $.',
                'Pair with a helpful `title` so users know the expected format.',
                'Remember localization—numeric formats differ by region, so consider per-locale patterns.'
            ],
            callouts: [
                {
                    title: 'Server validation still required',
                    body: 'Client-side patterns improve UX but can be bypassed, so always revalidate inputs server-side.'
                }
            ],
            references: [
                { label: 'MDN – pattern attribute', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern' }
            ]
        },
        {
            question: 'What HTML attribute is used to specify the language of a document or element?',
            answer: 'Set the `lang` attribute (e.g., `lang="en-US"`) on `<html>` or inline spans.',
            snippet: '&lt;html lang="en-US"&gt;...&lt;/html&gt;',
            bullets: [
                'Screen readers change pronunciation, hyphenation, and dictionary for spellcheck based on `lang`.',
                'Use nested `lang` for foreign quotes or names so assistive tech switches context.',
                'Combine with `dir` when switching to right-to-left languages.'
            ],
            references: [
                { label: 'MDN – lang attribute', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang' }
            ]
        },
        {
            question: 'What HTML attribute is used to require a form field to be filled out?',
            answer: 'Add the boolean `required` attribute so browsers block submission when empty.',
            snippet: '&lt;input type="email" name="contact" required&gt;',
            bullets: [
                'Native validation messages vary by browser—pair with custom helper text for clarity.',
                'Set `aria-required="true"` only for custom widgets (e.g., ARIA comboboxes) where native HTML isn’t used.'
            ],
            references: [
                { label: 'MDN – required attribute', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/required' }
            ]
        },
        {
            question: 'What HTML element is used to provide captions or subtitles for &lt;video&gt; and &lt;audio&gt;?',
            answer: 'Use `<track>` with `kind="captions"` or `kind="subtitles"`.',
            snippet: '&lt;video controls&gt;\\n  &lt;source src="/demo.mp4" type="video/mp4"&gt;\\n  &lt;track kind="captions" srclang="en" src="/demo.en.vtt" default&gt;\\n&lt;/video&gt;',
            attributes: [
                { name: 'kind', description: 'captions | subtitles | descriptions | chapters | metadata' },
                { name: 'srclang', description: 'Language code of the track.' },
                { name: 'default', description: 'Indicates the preferred track on load.' }
            ],
            bullets: [
                'Captions describe all dialogue and important sounds; subtitles assume the listener can hear audio.',
                'Tracks must point to WebVTT files (`.vtt`).',
                'Always provide captions for accessibility and legal compliance in many regions.'
            ],
            references: [
                { label: 'MDN – <track>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track' }
            ]
        },
        {
            question: 'What attribute must be set on a &lt;script&gt; to allow service worker registration from another origin?',
            answer: 'Set `crossorigin="anonymous"` (or `use-credentials`) so the script fetch is CORS-enabled.',
            snippet: '&lt;script src="https://cdn.example.com/app.js" crossorigin="anonymous"&gt;&lt;/script&gt;',
            callouts: [
                {
                    title: 'Why it matters',
                    body: 'Service workers require CORS-enabled scripts; without `crossorigin`, cross-origin registrations fail.'
                }
            ],
            bullets: [
                'Use `crossorigin="use-credentials"` when the script requires cookies/credentials.',
                'Ensure the CDN sets `Access-Control-Allow-Origin` so the fetch succeeds.'
            ],
            references: [
                { label: 'MDN – crossorigin', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin' }
            ]
        },
        {
            question: 'What ARIA attribute associates a form field with descriptive help text?',
            answer: '`aria-describedby` points to helper or error text elements.',
            snippet: '&lt;input id="username" aria-describedby="username-help"&gt;\\n&lt;small id="username-help"&gt;Use 3–16 lowercase letters.&lt;/small&gt;',
            bullets: [
                'Space-separate multiple IDs to combine helper and error messaging.',
                'Prefer visible helper text; `aria-describedby` simply links it semantically.'
            ],
            references: [
                { label: 'WAI-ARIA – aria-describedby', url: 'https://www.w3.org/TR/wai-aria/#aria-describedby' }
            ]
        },
        {
            question: 'What ARIA attribute provides an accessible label when no visible label is present?',
            answer: '`aria-label` supplies a text alternative for assistive tech.',
            snippet: '&lt;button aria-label="Open navigation menu"&gt;☰&lt;/button&gt;',
            bullets: [
                'Keep aria-label text concise; screen readers read it verbatim.',
                'If a visible label exists, use it instead of aria-label to avoid duplication.'
            ],
            references: [
                { label: 'WAI-ARIA – aria-label', url: 'https://www.w3.org/TR/wai-aria/#aria-label' }
            ]
        },
        {
            question: 'What JavaScript method moves keyboard focus to a specific element?',
            answer: 'Use `element.focus()` on a focusable node.',
            snippet: 'document.getElementById(\'modal-close\').focus();',
            references: [
                { label: 'MDN – HTMLElement.focus()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus' }
            ]
        },
        {
            question: 'What value should http-equiv have in a meta tag to prevent MIME type sniffing?',
            answer: 'Set `<meta http-equiv="X-Content-Type-Options" content="nosniff">`.',
            snippet: '&lt;meta http-equiv="X-Content-Type-Options" content="nosniff"&gt;',
            bullets: [
                'Use alongside the actual HTTP header for full coverage.',
                'Prevents browsers from executing scripts/styles served with the wrong MIME type.'
            ],
            references: [
                { label: 'MDN – X-Content-Type-Options', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options' }
            ]
        },
        {
            question: 'What attribute value disables browser autocomplete on form fields?',
            answer: 'Use `autocomplete="off"` on the form or individual input.',
            snippet: '&lt;form autocomplete="off"&gt;...&lt;/form&gt;',
            bullets: [
                'Browsers may ignore this on login/payment fields for security reasons.',
                'Consider more specific tokens (`autocomplete="one-time-code"`, `new-password`) instead of fully disabling.'
            ],
            references: [
                { label: 'MDN – autocomplete', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete' }
            ]
        },
        {
            question: 'What value should the rel attribute have to prefetch a resource for future navigation?',
            answer: 'Use `<link rel="prefetch" href="/lesson-2" as="document">`.',
            snippet: '&lt;link rel="prefetch" href="/lesson-2" as="document"&gt;',
            bullets: [
                'Prefetch occurs with low priority; do not rely on it for critical path resources.',
                'Combine with analytics or heuristics to prefetch likely next routes.'
            ],
            references: [
                { label: 'MDN – rel=prefetch', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/prefetch' }
            ]
        },
        {
            question: 'What HTML attribute is used to specify the mobile virtual keyboard type?',
            answer: '`inputmode` hints which on-screen keyboard to show.',
            snippet: '&lt;input inputmode="numeric" pattern="\\d*" name="otp"&gt;',
            bullets: [
                '`inputmode` is especially helpful for `type="text"` fields that still expect numeric data (e.g., OTP).',
                'Supported values include numeric, decimal, email, search, tel, url, etc.',
                'Combine with `autocomplete` for even better UX.'
            ],
            references: [
                { label: 'MDN – inputmode', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode' }
            ]
        },
        {
            question: 'What attribute can be added to a submit button to bypass validation?',
            answer: '`formnovalidate` on the submit button skips constraint validation for that submission.',
            snippet: '&lt;button type="submit" formnovalidate&gt;Save Draft&lt;/button&gt;',
            bullets: [
                'Great for “Save draft” flows where incomplete forms are acceptable.',
                'Only affects the button it is applied to; other submit buttons still validate.'
            ],
            references: [
                { label: 'MDN – formnovalidate', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-formnovalidate' }
            ]
        },
        {
            question: 'What attribute can be added to a form to disable all HTML5 validation?',
            answer: 'Add the `novalidate` attribute to the `<form>`.',
            snippet: '&lt;form novalidate&gt;...&lt;/form&gt;',
            bullets: [
                'Use when building custom validation flows (e.g., server-driven or framework-based).',
                'Remember to provide feedback manually since the browser won’t show native messages.'
            ],
            references: [
                { label: 'MDN – novalidate', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/novalidate' }
            ]
        },
        {
            question: 'What HTML attribute is used to specify a right-to-left text direction?',
            answer: 'Set `dir="rtl"` on the element or document.',
            snippet: '&lt;p dir="rtl"&gt;مرحبا بكم&lt;/p&gt;',
            bullets: [
                'Use `dir="auto"` to let the browser infer direction from the first strong character.',
                'Override short spans with `<bdo dir="ltr">` when embedding LTR text inside RTL paragraphs.'
            ],
            references: [
                { label: 'MDN – dir attribute', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir' }
            ]
        },
        {
            question: 'What ARIA role should you assign to a custom modal dialog?',
            answer: 'Use `role="dialog"` (or `alertdialog`) along with `aria-modal="true"`.',
            snippet: '&lt;div role="dialog" aria-modal="true" aria-labelledby="modal-title"&gt;...&lt;/div&gt;',
            bullets: [
                'Ensure focus moves into the dialog when it opens and returns to the trigger when it closes.',
                'Hide background content from screen readers via `aria-hidden="true"` or by removing it from the accessibility tree.',
                'Provide a keyboard-accessible close button.'
            ],
            references: [
                { label: 'WAI-ARIA – dialog role', url: 'https://www.w3.org/TR/wai-aria/#dialog' }
            ]
        },
        {
            question: 'What is the name of the meta tag used to control viewport scaling for responsive design?',
            answer: 'Use `<meta name="viewport" content="width=device-width, initial-scale=1">`.',
            snippet: '&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;',
            bullets: [
                'Ensures CSS pixels match device pixels, preventing desktop zoom-out on mobile.',
                'Avoid disabling zoom (e.g., `maximum-scale=1`) to preserve accessibility.'
            ],
            references: [
                { label: 'MDN – Using the viewport meta tag', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag' }
            ]
        },
        {
            question: 'What attribute do you add to &lt;img&gt; to enable native lazy loading?',
            answer: 'Add `loading="lazy"` to postpone image loading until near the viewport.',
            snippet: '&lt;img src="/hero.jpg" alt="Hero" loading="lazy"&gt;',
            bullets: [
                'Use `loading="eager"` for above-the-fold images that must load immediately.',
                'Still provide width/height to avoid layout shifts.'
            ],
            references: [
                { label: 'MDN – Lazy loading images', url: 'https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading' }
            ]
        },
        {
            question: 'What ARIA attribute marks a region as live for screen readers?',
            answer: '`aria-live` announces updates automatically.',
            snippet: '&lt;div aria-live="polite"&gt;Status updates appear here&lt;/div&gt;',
            bullets: [
                'Use `polite` for non-urgent updates and `assertive` for critical alerts.',
                'Pair with `role="status"` or `role="alert"` for common patterns.'
            ],
            references: [
                { label: 'WAI-ARIA – aria-live', url: 'https://www.w3.org/TR/wai-aria/#aria-live' }
            ]
        },
        {
            question: 'What tag is used to embed JSON-LD structured data?',
            answer: 'Use `<script type="application/ld+json">` containing your schema.',
            snippet: '&lt;script type="application/ld+json"&gt;{ "@context": "https://schema.org", "@type": "Organization", "name": "Zentry" }&lt;/script&gt;',
            bullets: [
                'Place in `<head>` for crawler visibility.',
                'Keep JSON minified to reduce page weight.'
            ],
            references: [
                { label: 'Google – Structured data', url: 'https://developers.google.com/search/docs/appearance/structured-data/intro' }
            ]
        },
        {
            question: 'What attribute should be added to an &lt;iframe&gt; for security restrictions?',
            answer: 'Use the `sandbox` attribute to limit capabilities.',
            snippet: '&lt;iframe src="https://example.com/widget" sandbox="allow-scripts allow-same-origin"&gt;&lt;/iframe&gt;',
            bullets: [
                'Without tokens, sandbox blocks scripts, forms, and same-origin access.',
                'Add only the permissions you truly need.'
            ],
            references: [
                { label: 'MDN – iframe sandbox', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox' }
            ]
        },
        {
            question: 'What HTML5 attribute must be set to true to make an element draggable?',
            answer: 'Set `draggable="true"` on the element.',
            snippet: '&lt;div draggable="true"&gt;Drag me&lt;/div&gt;',
            bullets: [
                'Use drag events (`ondragstart`, etc.) to customize behavior.',
                'For accessibility, provide keyboard alternatives.'
            ],
            references: [
                { label: 'MDN – HTML Drag and Drop API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API' }
            ]
        },
        {
            question: 'What is the name of the meta tag for Content Security Policy?',
            answer: 'Use `<meta http-equiv="Content-Security-Policy" content="default-src \'self\'">`.',
            bullets: [
                'Prefer HTTP headers for production; meta tags work when headers are unavailable.',
                'Start with `Content-Security-Policy-Report-Only` to monitor before enforcing.'
            ],
            references: [
                { label: 'MDN – Content Security Policy', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP' }
            ]
        },
        {
            question: 'What attribute is used on &lt;script&gt; and &lt;link&gt; to ensure resource integrity?',
            answer: 'Add the `integrity` attribute with a Subresource Integrity hash.',
            snippet: '&lt;script src="https://cdn.example.com/app.js" integrity="sha384-..." crossorigin="anonymous"&gt;&lt;/script&gt;',
            bullets: [
                'Must pair with `crossorigin="anonymous"` for cross-origin resources.',
                'Regenerate hashes whenever the resource changes.'
            ],
            references: [
                { label: 'MDN – Subresource Integrity', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity' }
            ]
        },
        {
            question: 'What is the meta tag attribute for controlling referrer information?',
            answer: 'Use `<meta name="referrer" content="no-referrer">` (or other policies like `strict-origin`).',
            bullets: [
                'Equivalent to the `Referrer-Policy` HTTP header.',
                'Use `strict-origin-when-cross-origin` for a balanced default.'
            ],
            references: [
                { label: 'MDN – Referrer-Policy', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy' }
            ]
        },
        {
            question: 'What value should the rel attribute have to preload a resource?',
            answer: 'Use `<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin>`.',
            bullets: [
                'Always include the `as` attribute to indicate the resource type.',
                'Preload only critical resources needed during initial rendering.'
            ],
            references: [
                { label: 'MDN – rel=preload', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content' }
            ]
        },
        {
            question: 'What rel attribute value links a web app manifest?',
            answer: 'Use `<link rel="manifest" href="/manifest.webmanifest">`.',
            bullets: [
                'Manifest defines icons, theme colors, and install metadata for PWAs.',
                'Serve with `application/manifest+json` MIME type.'
            ],
            references: [
                { label: 'MDN – Web App Manifest', url: 'https://developer.mozilla.org/en-US/docs/Web/Manifest' }
            ]
        },
        {
            question: 'What is the prefix for custom data attributes in HTML?',
            answer: 'Use `data-*` attributes (e.g., `data-user-id="42"`).',
            snippet: '&lt;button data-plan="pro"&gt;Upgrade&lt;/button&gt;',
            bullets: [
                'Access via `dataset.plan` in JavaScript.',
                'Keep names lowercase/kebab-case for consistency.'
            ],
            references: [
                { label: 'MDN – Using data attributes', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes' }
            ]
        },
        {
            question: 'What element is used to provide suggestions for an &lt;input&gt;?',
            answer: 'Use `<datalist>` paired with an `<input list="...">`.',
            snippet: '&lt;input list="langs" name="lang"&gt;\\n&lt;datalist id="langs"&gt;\\n  &lt;option value="HTML"&gt;\\n  &lt;option value="CSS"&gt;\\n&lt;/datalist&gt;',
            bullets: [
                'Users can still enter values not in the list.',
                'Great for hints like languages, IDE names, etc.'
            ],
            references: [
                { label: 'MDN – <datalist>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist' }
            ]
        },
        {
            question: 'What element is used to embed SVG graphics directly in HTML?',
            answer: 'Use the `<svg>` element inline for resolution-independent graphics.',
            snippet: '&lt;svg width="120" height="40" viewBox="0 0 120 40" role="img" aria-label="Zentry"&gt;...&lt;/svg&gt;',
            bullets: [
                'Inline SVGs inherit CSS variables and can be styled dynamically.',
                'Add `role`/`aria-label` for meaningful graphics.'
            ],
            references: [
                { label: 'MDN – <svg>', url: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg' }
            ]
        },
        {
            question: 'What rel attribute value is used for canonical preferred URL?',
            answer: 'Use `<link rel="canonical" href="https://example.com/learn">`.',
            bullets: [
                'Helps search engines know which URL to index when duplicates exist.',
                'Use absolute URLs to avoid ambiguity.'
            ],
            references: [
                { label: 'Google – Canonical URLs', url: 'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls' }
            ]
        },
        {
            question: 'What HTML attribute on &lt;link&gt;/&lt;a&gt; specifies the language of the linked document?',
            answer: 'Use the `hreflang` attribute to indicate the target language.',
            snippet: '&lt;link rel="alternate" href="https://example.com/es" hreflang="es"&gt;',
            bullets: [
                'Critical for multilingual SEO; pair with `rel="alternate"`. ',
                'Use ISO language codes (optionally with region, e.g., `en-GB`).'
            ],
            references: [
                { label: 'MDN – hreflang', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hreflang' }
            ]
        },
        {
            question: 'What attribute enables native lazy loading for &lt;iframe&gt; elements?',
            answer: 'Add `loading="lazy"` on the `<iframe>`.',
            snippet: '&lt;iframe src="https://maps.example.com/embed" loading="lazy"&gt;&lt;/iframe&gt;',
            bullets: [
                'Reduces bandwidth by deferring heavy embeds until they approach the viewport.',
                'Combine with `title` and `aria-label` for accessibility since content loads later.'
            ],
            references: [
                { label: 'MDN – Lazy loading iframes', url: 'https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading#iframes' }
            ]
        },
        {
            question: 'What is your secret (ambiguous, intentionally placed)?',
            answer: 'No mystery sauce—consistent fundamentals, semantic markup, and empathy for users are the “secret” to resilient front-ends.',
            bullets: [
                'Prioritize accessibility and performance before visual polish.',
                'Back every pattern with documentation so future teammates can keep the quality bar high.'
            ],
            references: [
                { label: 'WAI – Accessibility Fundamentals', url: 'https://www.w3.org/WAI/fundamentals/' }
            ]
        },
        {
            question: 'What is the HTML tag used to define a shadow root in a custom element?',
            answer: 'Declarative Shadow DOM uses `<template shadowroot="open">` (or `"closed"`) to define a shadow root in markup.',
            snippet: '&lt;template shadowroot="open"&gt;\\n  &lt;style&gt;slot[name="title"] { font-weight: 600; }&lt;/style&gt;\\n  &lt;slot name="title"&gt;&lt;/slot&gt;\\n&lt;/template&gt;',
            bullets: [
                'For imperative creation, call `this.attachShadow({ mode: \'open\' })` in the element’s constructor.',
                'Declarative shadow DOM is ideal for SSR frameworks because it avoids JavaScript hydration.'
            ],
            references: [
                { label: 'MDN – Declarative Shadow DOM', url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement#declarative_shadow_dom' }
            ]
        },
        {
            question: 'Write the HTML using &lt;picture&gt; to load large image on &gt;800px and small otherwise.',
            answer: 'Use media queries on `<source>` elements so browsers pick the right asset.',
            snippet: '&lt;picture&gt;\\n  &lt;source srcset="/images/hero-xl.jpg" media="(min-width: 800px)"&gt;\\n  &lt;img src="/images/hero-sm.jpg" alt="Zentry dashboard preview" width="640" height="360"&gt;\\n&lt;/picture&gt;',
            bullets: [
                'Always include a fallback `<img>`.',
                'Define explicit width/height to prevent layout shift.'
            ],
            references: [
                { label: 'MDN – <picture>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture' }
            ]
        },
        {
            question: 'Write the HTML for an accessible button that toggles a menu using ARIA.',
            answer: 'Use `aria-expanded`, `aria-controls`, and an IDed menu container.',
            snippet: '&lt;button id="menu-toggle" aria-controls="main-menu" aria-expanded="false"&gt;Menu&lt;/button&gt;\\n&lt;nav id="main-menu" hidden&gt;...&lt;/nav&gt;',
            bullets: [
                'Update `aria-expanded` and toggle the `hidden` attribute via JavaScript.',
                'Ensure focus management: move focus into the menu when it opens.'
            ],
            references: [
                { label: 'WAI-ARIA Authoring Practices – Disclosure', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/' }
            ]
        },
        {
            question: 'Write the JavaScript to define a custom element called &lt;my-widgets&gt;.',
            answer: 'Extend HTMLElement, attach a shadow root, and register with `customElements.define`.',
            snippet: 'class MyWidgets extends HTMLElement {\\n  constructor() {\\n    super();\\n    const shadow = this.attachShadow({ mode: \'open\' });\\n    shadow.innerHTML = `\\n      &lt;style&gt;:host { display: block; }&lt;/style&gt;\\n      &lt;slot&gt;&lt;/slot&gt;\\n    `;\\n  }\\n}\\ncustomElements.define(\'my-widgets\', MyWidgets);',
            bullets: [
                'Call `super()` before using `this` in the constructor.',
                'Use `connectedCallback`/`disconnectedCallback` for lifecycle hooks.'
            ],
            references: [
                { label: 'MDN – Using custom elements', url: 'https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define' }
            ]
        }
    ];

    $: totalPages = Math.ceil(fundamentals.length / LESSONS_PER_PAGE);
    $: pageOffset = (currentPage - 1) * LESSONS_PER_PAGE;
    $: paginatedFundamentals = fundamentals.slice(pageOffset, pageOffset + LESSONS_PER_PAGE);

    function goToPage(page: number) {
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Poppins:wght@700&display=swap');

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


<div class="min-h-screen text-white font-medium relative dashboard-bg" style="background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%); overflow: visible; font-family: poppins;">
    <!-- Animated gradient overlay -->
    <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
    <!-- Subtle dot pattern -->
    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>
    <DashboardHeader title="Learn HTML" user={data.user || undefined} pageName="Learn" />
    <MiniHeader />

    <section class="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <div class="rounded-3xl border border-white/15 bg-[#090303]/70 p-8 shadow-2xl backdrop-blur">
            <div class="flex flex-col gap-8 lg:flex-row">
                <div class="flex-1 space-y-4">
                    <div class="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">
                        <span>HTML Introduction</span>
                        <span class="h-3 w-px bg-amber-400/50"></span>
                        <span>Last Updated · {lastUpdated}</span>
                    </div>
                    <h1 class="text-4xl font-semibold text-white">Build the Skeleton of the Web</h1>
                    <p class="text-white/80">
                        HTML (HyperText Markup Language) defines the structure of every page. Lock in the vocabulary, recognize what
                        each element contributes, and you will craft semantic layouts faster.
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
                        <div class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
                            <p class="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold">Language Type</p>
                            <p class="mt-2 text-xl font-semibold text-amber-100">Markup · Declarative</p>
                        </div>
                        <div class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
                            <p class="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold">Primary Job</p>
                            <p class="mt-2 text-xl font-semibold text-amber-100">Structure & Semantics</p>
                        </div>
                        <div class="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
                            <p class="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold">Best Combo</p>
                            <p class="mt-2 text-xl font-semibold text-amber-100">CSS + JS</p>
                        </div>
                    </div>
                </div>
                <div class="flex-1 rounded-2xl border border-emerald-500/30 bg-[#050505] p-4 shadow-inner">
                    <div class="flex items-center justify-between text-xs text-white/60">
                        <span>&lt;!DOCTYPE html&gt;</span>
                        <div class="space-x-2">
                            <span class="inline-block h-3 w-3 rounded-full bg-red-500"></span>
                            <span class="inline-block h-3 w-3 rounded-full bg-amber-400"></span>
                            <span class="inline-block h-3 w-3 rounded-full bg-emerald-400"></span>
                        </div>
                    </div>
                    <pre class="mt-4 h-full overflow-auto rounded-xl bg-gradient-to-b from-[#090909] to-[#050505] p-4 text-sm leading-relaxed text-emerald-200">
<code>{@html codeSample}</code>
                    </pre>
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

        <div class="rounded-3xl border border-amber-500/30 bg-black/40 p-8 shadow-xl backdrop-blur">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p class="text-xs uppercase tracking-[0.35em] text-amber-300 font-semibold">HTML Elements vs Tags</p>
                    <h2 class="text-3xl font-semibold text-white">Name the pieces correctly</h2>
                </div>
                <a
                    href="https://www.geeksforgeeks.org/html-elements/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 rounded-full border border-amber-400/50 px-4 py-2 text-sm text-amber-200 transition hover:bg-amber-400/10"
                >
                    Deep dive on GeeksforGeeks →
                </a>
            </div>
            <div class="mt-6 grid gap-6 md:grid-cols-2">
                <div class="rounded-2xl border border-white/10 bg-[#0a0606]/70 p-6">
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Element Anatomy</p>
                    <p class="mt-3 text-white/85">
                        <code class="rounded bg-white/10 px-2 py-1 text-sm text-emerald-200">&lt;h1 class="hero"&gt;Heading&lt;/h1&gt;</code>
                        is a single element: opening tag, optional attributes, content, and closing tag. Understanding this structure is
                        crucial for accessibility and SEO.
                    </p>
                </div>
                <div class="rounded-2xl border border-white/10 bg-[#090909]/70 p-6">
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">DOM Connection</p>
                    <p class="mt-3 text-white/85">
                        Browsers translate tags into DOM nodes. Clean, semantic HTML creates predictable trees that CSS and JS can
                        manipulate with ease.
                    </p>
                </div>
            </div>
        </div>

        <div class="space-y-10">
            <div>
                <p class="text-xs uppercase tracking-[0.35em] text-white/60">Fundamentals</p>
                <h2 class="mt-2 text-3xl font-semibold text-white">Basic Tags & Attributes</h2>
                <p class="mt-3 text-white/80">
                    Quick-fire questions, canonical answers, and official references. Use this like a GeeksforGeeks rapid sheet
                    before you jump into practice problems.
                </p>
            </div>
            <div class="relative space-y-8">
                <span
                    class="pointer-events-none absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-emerald-400/70 via-white/20 to-transparent lg:block"
                ></span>
                {#each paginatedFundamentals as block, index}
                    <article class="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur">
                        <div class="flex items-start gap-5">
                            <div class="relative flex-none">
                                <span class="text-4xl font-extrabold text-white/20">{String(pageOffset + index + 1).padStart(2, '0')}</span>
                                <span
                                    class="absolute left-1/2 top-12 hidden h-10 w-px -translate-x-1/2 bg-white/10 lg:block"
                                ></span>
                            </div>
                            <div class="flex-1 space-y-3">
                                <h3 class="text-xl font-semibold text-white">{block.question}</h3>
                                <p class="text-white/85">{block.answer}</p>

                                {#if block.snippet}
                                    <pre class="max-w-full overflow-x-auto rounded-xl bg-[#0f0f0f]/80 p-4 text-sm text-emerald-200 whitespace-pre-wrap break-words">
<code>{@html block.snippet}</code>
                                    </pre>
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
                                            class={`rounded-2xl border px-4 py-3 text-sm ${
                                                callout.tone === 'warning'
                                                    ? 'border-amber-400/40 bg-amber-400/10 text-amber-100'
                                                    : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                                            }`}
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
                                                            <span class="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-200">
                                                                {attr.badge}
                                                            </span>
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
                                    class={`rounded-full border px-3 py-1 text-xs ${
                                        currentPage === pageIndex + 1
                                            ? 'border-emerald-400 text-emerald-200'
                                            : 'border-white/20 text-white/70 hover:border-white/40'
                                    }`}
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
    </section>
</div>
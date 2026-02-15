---
title: "Using Mermaid Diagrams in Svelte 5 (continued)"
description: "My SvelteKit setup for markdown blog notes using Mdsvex and Mermaid for diagramming"
date: '2026-02-14'
thumbnailText: "Mermaid & Svelte"
categories: ["Svelte", "Markdown", "Shiki", "Mermaid", "Mdsvex", "CloudFlare"]
published: true
colorStart: "190 100% 50%"
colorEnd: "130 100% 50%"
---

## The Persisting Issue

It's been almost three months since I last posted about my own solution
for using `Mermaid.js` in conjunction with Svelte and SvelteKit in my
[previous article](https://www.danielvm.dev/blog/mermaid-svelte). The
solution that I came up with was a custom-made Svelte component that
would render diagrams client-side using the Mermaid JS libary and using
the `onMount()` function that Svelte provided. In turn, Mdsvex was able
to understand both Markdown elements and Svelte code inside my blog posts
which are essentially `.md` files. So what's the issue?

Portability.

The structure of my markdown files with the added Svelte components made it
so that my markdown files are not very portable, since they include many
non-native markdown elements and tags.

What would look like this:

``` markdown

## My Blog Post

Here's my very beautiful sequence Diagram!

\`\`\`mermaid
    SequenceDiagram
       First -> Second
       Second -> Third
       # etc...
\`\`\`

```

Instead looks like this:

``` markdown

## My Blog Post

<script>
    import MermaidComponent from "$lib/components/Mermaid.svelte"

    const myMermaidDiagram = `
        SequenceDiagram
           First -> Second
           Second -> Third
           # etc...
    `
</script>

Here's my very beautiful sequence Diagram!

<MermaidComponent src={myMermaidDiagram} />
```

Very cluttered, not Markdown native, very **ugly**. If I wanted to port these
articles anywhere else then I would need to re-write several parts of the
blog posts which is not very conveninent. So then the goal is very simple:
Be able to use Mermaid diagrams without using Svelte components and keep
the markdown consistent and native.

## Re-exploring the Original Issue

To understand why my Mermaid diagrams wouldn't render, you have to look at
the "game of telephone" happening in my build process. Here’s the breakdown
of the four players and where they clashed:

1. **Mdsvex (The Boss)**: Converts Markdown to Svelte. It uses the
Unified ecosystem to turn my text into an Abstract Syntax Tree (AST)—a
map of every element in my post.

2. **Shiki (The Greedy Highlighter)**: This is where the bug started.
In the Mdsvex lifecycle, Shiki’s highlight function runs before the Rehype
plugins. It "baked" my Mermaid code into a raw HTML string, effectively hiding
the node from the rest of the pipeline.

3. **Rehype-Mermaid (The Blind Plugin)**: This plugin expects to find a "code node"
in the AST to transform. Since Shiki already turned that node into a flat
string, Rehype-Mermaid saw nothing to process and just skipped right over it.

4. **Cloudflare (New Issue)**: This is actually a new addition to the
problem! Even if I fixed the pipeline, most Mermaid plugins render SVGs at
build-time using a headless browser (Puppeteer).
Cloudflare Workers/Pages can't run those binaries, making server-side rendering
a non-starter.

TLDR: Shiki was "over-processing" my code blocks before the diagram generator
could see them, and even if the diagram generator was able to see them, the
infrastructure where my website is deployed on, CloudFlare, wouldn't let me
process them on the server-side. So then... what was the solution?

## The "Native" Solution

The actual solution wasn't very far away from the first solution posted
in the other blog post. We're still going to be rendering the diagrams in
the browser after the server sends the HTML. However, in our highlighter
code we have to specify that all Mermaid specific code blocks should be
returned wrapped around `<pre>` HTML elements with the correct class name.

The resulting `svelte.config.js` file then looks like this:

```javascript
const highlighterPromise = createHighlighter({
	themes: ['catppuccin-mocha'],
	langs: ['go', 'json']
})

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', ".md"],
	preprocess: [vitePreprocess(), mdsvex({
		extensions: [".md", ".svx"],
		highlight: {
			highlighter: async (code, lang = 'text') => {
				if (lang === 'mermaid') {
					// Return a raw div that the client-side library will target
					// We wrap in {@html} to ensure Svelte doesn't parse it
					return `{@html \`<pre class="mermaid">${code}</pre>\`}`;
				}
				const highlighter = await highlighterPromise
				await highlighter.loadLanguage('go', 'json', 'svelte', 'mermaid', 'markdown');
				const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: 'catppuccin-mocha' }));
				return `{@html \`${html}\`}`
			}
		},
		rehypePlugins: [
            // DO NOT use Rehype-Mermaid
			rehypeSlug,
			[rehypeAutolinkHeadings, {
				behavior: "wrap",
				properties: {
					className: 'heading-anchor',
				}
			}]
		]
	})],
};
```

Then after, inside the `routes/blog/[slug]/+layout.svelte` we
would then initialize Mermaid when in the browser and let Mermaid
render the diagrams for every blog post that's currently on focus.

```javascript
	import { onMount } from "svelte";
	import { browser } from "$app/environment";

    // Only execute on the browser and dynamically import mermaid,
    // configure it and finally let it run asynchronously
	onMount(async () => {
		if (browser) {
			const mermaid = (await import("mermaid")).default;

			mermaid.initialize({
				startOnLoad: true,
				theme: "dark",
				securityLevel: "loose",
			});

			await mermaid.run();
		}
	});
```

Now then, we can replace all the usage of the `<MermaidComponent>` with
the original backticks used in Markdown and Mermaid will be able to
render them!

## Some Caveats for this Solution

But yet again, with a different solution there are always trade-offs that
need to be considered.

1. **Flash of Unstyled Content (FOUC)**: Since the custom component rendered
a loader before Mermaid was able to
finish rendering the diagram, this solution makes it so that we lose
the loader in return of not using Svelte components in the Markdown.
2. **Increased Bundle Size**: Adding Mermaid to the bundled website adds roughly
300kb-1MB to the site's JavaScript payload.
3. **No JS, No Diagrams**: Users that have JavaScript disabled for their browsers
would only see the raw diagram text.3

While client-side rendering solves the Cloudflare and Shiki collision issues,
it shifts the 'work' from the build server to the reader's browser. We
gain deployment stability, but we pay for it with a slight layout
shift and a larger JavaScript bundle.

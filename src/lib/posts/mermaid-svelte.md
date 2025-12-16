---
title: "Using Mermaid Diagrams in Svelte 5"
description: "My SvelteKit setup for markdown blog notes using Mdsvex and Mermaid for diagramming"
date: '2025-12-16'
thumbnailText: "Mermaid & Svelte"
categories: ["Svelte", "Markdown", "Shiki", "Mermaid", "Mdsvex"]
published: true
colorStart: "45 100% 50%"
colorEnd: "345 100% 50%"
---

<script>
    import Mermaid from '$lib/components/Mermaid.svelte';
    const existingPipeline = `
    flowchart LR;
	A[Markdown File<br />.md/ .svx] --> B[Mdsvex<br />Markdown -> Svelte Component]
	B --> C[Shiki <br /> Syntax Highlighting]
	C --> D[Svelte Compiler & Render]
	D --> E[HTML Output<br />+ Framework Marker]
    `

    const mdsvexUnifiedPipeline = `
    flowchart TB
    A[Raw Markdown File<br/>.md/.svx] --> B[Mdsvex Pipeline]

    subgraph Mdsvex Transform
        B --> C[Markdown Parser / mdsvex_parser]
        C --> D[Escape Brackets & Code]
        D --> E[Shiki Highlighting<br/>highlight_blocks]
        E --> F[remark2rehype<br/>Markdown AST → HTML AST]
        F --> G[rehype Plugins<br/>Mermaid plugin, etc.]
        G --> H[Stringify HAST → HTML Output]
    end

    %% Highlight the conflict
    style E fill:#ff4d4d,stroke:#ffffff,stroke-width:1px
    style G fill:#ff4d4d,stroke:#ffffff,stroke-width:1px

    E -->|Transforms code blocks & escapes characters before Mermaid can run| G
    `
</script>

## Overview

When I built the blog section of my site and published my first post, I
knew I wanted to use flowcharts and sequence diagrams. Since the posts
are written in Markdown, [Mermaid](https://mermaid.js.org) was
the obvious choice, because it’s straightforward and works
well on the page. But getting [Svelte](https://svelte.dev),
[Mdsvex](https://mdsvex.pngwn.io), [Shiki](https://shiki.style)
and Mermaid to play nicely together came with more
gotchas than I expected. In this post,
I’ll walk through the approach I settled on for integrating
Mermaid diagrams cleanly within a Svelte-based blog.

## The Existing Pipeline

At first glance, my setup looked very straightforward: Markdown files
processed by Mdsvex, syntax highlighting on code blocks handled by Shiki,
Mermaid reads Mermaid-specific code and transforms it into a diagram, and
the result is rendered by Svelte. It felt reasonable to assume that a Mermaid
diagram defined in a triple-backtick code block would survive this pipeline intact.

My pipeline looked like this:

<Mermaid code={existingPipeline} />

In reality, the Markdown goes through several transformations before it ever
reaches the browser. Mdsvex first converts the Markdown file in a Svelte component.
During this step, fenced code blocks are identified as nodes rather than text.
Headings paragraphs, fenced code blocks are all converted into nodes in a Svelte
render tree rather than being emitted as raw text.

Before the component is rendered, fenced code blocks are passed through Shiki for
syntax highlighting. Shiki replaces the original code block content with HTML spans
and styles, injecting the result using `{@html}`. This works well for most languages,
since the output is meant to be displayed, not consumed.

Once the content is compiled and rendered, Svelte adds its own internal markers
to the output. These appear as HTML comment nodes `<!---->`
and are used to track rendering
boundaries and updates. They are invisible in the browser, but they're still part
of the generated markup and DOM structure which you can see using the browser developer
tools.

By the time the page is delivered to the client, whether using Server-side Rendering,
Client-side Rendering or pre-rendering, a "simple" fenced code block is no longer
plain
text. It has been heavily transformed into highlighted HTML and augmented with framework-level
markers. None of this is obvious when looking at the original Markdown file, but
it becomes critical when introducing a tool like Mermaid, which expect to
receive clean, unmodified text input.

## What Actually Broke (Or Didn't Work)

My initial assumption was that Mermaid diagrams would work out of the box by using
fenced Markdown code blocks with the `mermaid` language identifier. This is a common
pattern in Markdown-based tooling, and many static site generators support it directly
or via a small plugin. It felt like the simplest and most natural approach.

In practice, nothing happened.

The code block rendered as highlightex text, exaclty like any other language. No diagram
appeared, and no error was thrown. This failure was easy to misinterpret as a missing
initialization step or a configuration issue, rather than a deep incompatibility in the
rendering pipeline.

Part of the issue is that Mermaid makes specific assumptions about how its inpuit
is delivered. It expects either a container element with `language-mermaid` or `mermaid`
class, or direct access to the raw diagram defintion so it can parse and render it itself.
In this setup, neither condition was met. By the time the code block reached the brower,
it had already been transformed into highlighted HTML, and the original text was
no longer available in a form Mermaid could consume.

What looked like the simplest possible solution turned out not to be simple at all.
The problem wasn't that Mermaid failed to initialize, it was that the input Mermaid
requires never actually existed in the final output.

## How Mermaid Expects to Render Diagrams

Mermaid does not render diagrams from HTML. It renders diagrams from raw plain text,
obviously with special syntax, but nonetheless in the context of Svelte and the
rendering pipline, the block of text must return **untouched**.
In the simplest case, Mermaid just looks for elements marked explicitly as diagram
definitions, either by class name or by passing the raw diagram text directly
through its API. Mermaid does not attempt to extract diagram definitions from
highlighted markup or tolerate additional nodes mixed into the input.

This details is easy to mix because many tools treat Mermaid blocks as a special
case and preserve them verbatim. In those environments, the diagram text
reaches Mermaid untouched, so everything "just works".

In my setup, Mermaid ran after Markdown processing, syntax highlighting, and
Svelte's rendering steps. By that p oint, the original diagram no longer existed
as plain text. It had already been transformed into HTML and augmented by the framework.

Nothing was wrong with Mermaid, it simply never received valid input.

## Why Markdown or HTML-Level Fixes Didn't Work

Once it became clear that fenced code blocks weren't rendering diagrams, the next
instinct was to fix the problem at the Markdown level. Mermaid
is often integrated via [remark](https://github.com/remarkjs)
or [rehype](https://github.com/rehypejs), so it was
reasonable to assume that the right extension or
configuration would make everything fall into place.

This wasn't the issue.

The real constraint came from the order of operations in the
Mdsvex's [unified](https://unifiedjs.com) pipeline.
Syntax highlighting with Shiki happened early,
before any Rehype or Remark transforms could
meaningfully intervene. Once highlighting ran, the Mermaid diagram
was no longer Markdown or plain-text: It was heavily transformed HTML. And
like mentioned before, Mermaid is very sensitive about what type of input
it receives to render a diagram.

Here’s a simplified view of Mdsvex’s rendering pipeline. If you want
to dig into the source, the exact file handling this logic is available
[here](https://github.com/pngwn/MDsveX/blob/main/packages/mdsvex/src/index.ts).

<Mermaid code={mdsvexUnifiedPipeline} />

At that point any attempt to process Mermaid at the Markdown or HTML level required
sacrificing Shiki entirely. Preventing highlighting for Mermaid blocks
would have meant entirely bypassing the highlighter or restructuring the
pipeline in a way, or even further, requiring a change at the library level.
None of these options were acceptable.

This is why all the fixes at the pipeline-level failed. It wasn't
that Mermaid couldn't be parsed, it was that preserving Mermaid's raw
input conflicted directly with how the rest of the content was processed.
The pipeline could support highlighting, or it could support Mermaid,
but not both at the same stage. It was a **fundamental ordering conflict**.

## Letting Svelte Render Diagrams

My initial asssumption was that Mermaid diagrams should behave like normal
fenced code blocks. They look like code, they live in markdown, so treating
them like syntax-highlighted text felt natural. In an Mdsvex + Svelte setup,
that assupmtion break very quickly.

Mdsves lets you mix markdown and Svelte freely, but everything eventually just
compiles down to plain HTML, CSS, and Javascript. Once that happens, there's no
special meaning attached to a "code block" anymore. Just like when Shiki "highlights"
code, all it does is wrapping parts of the text in `<span>`s; point being: It's
just rendered output. Mermaid on the other hand, isn't static content, it needs
to be run at runtime and turn text into SVG.

The fix was mostly conceptual: diagrams don't belong in the markdown pipeline as
code. They belong in the Svelte layer as components. Once I treated Mermaid diagrams
as components instead of code blocks, the pipeline stopped fighting me. Sure it
would be nice to have all my diagrams written in only markdown-syntax, but this is
a tradeoff for this solution I'm willing to put up with.

## Rendering Mermaid Diagrams as a Svelte Component

Instead of embedding Mermaid syntax inside fenced code blocks, the diagram definition
is passed directly to a component as plain-text via a `$prop`. This keeps it out of
Mdsvex's highlighting and escaping stages and let's Mermaid run at the correct layer:
at runtime, in the browser.

Here's a snippet of my `Mermaid` component:

``` svelte
// src/lib/components/Mermaid.svelte

<script lang="ts">
    let { height = 400, code = "" } = $props();
</script>

<div class="container" style:height>
    <pre class="mermaid">
	{code}
    </pre>
</div>
```

Since I'm also using SvelteKit for my blog, then I'm making use of their client-side
router. Therefore, the place where I initialize Mermaid is not at the component-level
but at the page-level:

``` svelte
// src/routes/blog/[slug]/+page.svelte

<script lang="ts">
    import type { PageProps } from "./$types";
    import { onMount } from "svelte";
    import mermaid from "mermaid";

    mermaid.initialize({ theme: "dark", startOnLoad: false });

    // Only runs when attached to the DOM
    onMount(() => {
	    setTimeout(async () => {
		    await mermaid.run();
	    }, 0);
    });
    let data: PageProps = $props();
</script>

<div class="prose">
    <data.data.content />
</div>

```

Then finally, I can make use of it in an `.md` file and Mdsvex will understand
I'm using a component rather than fenced code blocks to render the diagram:

``` markdown
// src/posts/example.md

---
title: "This is an Example Article"
description: "Literally an example article"
date: "1999-30-07"
---

<script>
    import Mermaid from "$lib/components/Mermaid.svelte"
</script>

## Hello World!

Lorem Ipmsum Dolor sit amet...

<Mermaid code={`
    sequenceDiagram
    participant Master
    participant Worker
    Master->>Worker: Hello`
    }
/>
```

### Why Slots and Snippets Break Mermaid

It's tempting to pass Mermaid defintions using Svelte 5's slot mechanism that
utilizes the [snippets](https://svelte.dev/docs/svelte/snippet) and then
render them using `{@render children()}`. On the surface, this looks like a clean
way to keep diagrams inline with markdown content because, let's face it:
Passing the diagram definition via a prop looks odd. So initally my Mermaid
component used to look like this:

``` svelte
<script lang="ts">
	let rendered: boolean = $state(true);
	let { height = 400, children } = $props();
</script>

<div class="container" style:height>
	<pre class="mermaid">
		{@render children?.()} // allows slotting content
	</pre>
</div>

```

With this change then instead of passing the diagram definition via a prop
I could just wrap the text with my component cleanly like this:

``` svelte
<Mermaid>
sequenceDiagram
    participant Master
    participant Worker
    Master->>Worker: Hello
</Mermaid>
```

In partice however, this causes **subtle but frustrating failures**. Mermaid expects
**unmodified** text as input. Svelte's rendering model, however, does not
treat slot content as raw strings. During rendering and hydration, Svelte injects
internal markets into the DOM to track updates. These markers are invisible
in the browser ut still exist as comment nodes (`<!---->`).

When slot content is rendered and then read back (especially using `{@render children()}`), those hydration markers can end up interleaved with the diagram text defintion.
From Mermaid's perspective, that's no longer valid syntax, and it will actually not look correct visually. In my case, sequence diagrams were working correctly but the last
definition always had an extra "\<!----\>" in the name. In the example above then,
the diagram definition would instead look like this from the browser tools:

``` svelte
<Mermaid>
sequenceDiagram
    participant Master
    participant Worker
    Master->>Worker: Hello
    \<\!----\>  // Incorrect syntax according to Mermaid
</Mermaid>
```

Passing the diagram definition as a plain string prop avoids this entirely. Props
exist as raw data, not rendered DOM content, which guarantees that Mermaid receives
clean and unaltered input every time. However, rendering Mermaid diagrams through a
Svelte component isn't free of compromises.

## Trade-offs of a Component-Based Approach

The most obvious limitation is that diagrams are now rendered **entirely client-side**.
Because Mermaid runs inside the `onMount()` function, no SVG is produced during
prerendering or server-side rendering. For most blogs this is acceptable because
the surrounding content is still static, but it does mean that diagrams won't appear
in the initial HTML.

There's also some clear loss of markdown ergonomics. Fenced code blocks are easy to
write, easy to read in raw markdown, and benefit from editor tooling and copy-pase
behavior. Replacing them with Svelte components is slightly more verbose and less
familiar, especially for long diagrams.

However, these trade-offs are intentional and the changes done to the markdown files
feel very idiomatic with Svelte. Treating them as components aligns better with how
they actually work and avoids brittle interactions with the markdown pipeline.
In exchange, this approach provides predictable rendering, avoids hydration issues,
and keeps diagram logic isolated from unrelated preprocessing steps like syntax
highlighting.

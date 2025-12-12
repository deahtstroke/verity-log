---
title: "Mermaid and Svelte 5"
description: "My SvelteKit setup for markdown blog notes using Mdsvex and Mermaid for diagramming"
date: '2025-12-11'
thumbnailText: "Mermaid & Svelte"
categories: ["Svelte", "Markdown", "Mermaid", "Mdsvex"]
published: true
colorStart: "45 100% 50%"
colorEnd: "345 100% 50%"
---

## Introduction

When I built the blog section of my site and published my first post, I
knew I wanted to use flowcharts and sequence diagrams. Since the posts
are written in Markdown, [Mermaid](https://mermaid.js.org) was
the obvious choice, because it’s straightforward and works
well on the page. But getting [Svelte](https://svelte.dev),
[Mdsvex](https://mdsvex.pngwn.io), and Mermaid to play nicely
together came with more gotchas than I expected. In this post,
I’ll walk through the approach I settled on for integrating
Mermaid diagrams cleanly within a Svelte-based blog.

## Svelte, Mdsvex and Mermaid

Let's discuss these three tools and what exactly is their role
in making it possible for developers and blog-writers to be able to effectively
show diagrams in a website built using Svelte and SvelteKit 5.

- **Mdsvex**: Svelte pre-processor that let's you use Svelte components in markdown
and vice-versa. This is what lets your blog posts use `.svx/.md` files while still
embedding interactive Svelte components when needed.
- **Mermaid**: Diagramming tool that turns markdown code-stylized definitions
into flowchards, sequence diagrams, and other visuals. It's the layer that converts
Markdown-embedded diagram code itno actual SVG or HTML output.
- **Svelte**: UI framework that compiles components to ultra fast and lightweight
JavaScript. It's the runtime environment where Mermaid ultimately renders, and
where Mdsvex processed markdown ends up as normal Svelte components.

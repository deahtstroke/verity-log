---
title: "Its All Just Words"
description: "A thread of thinking that started with a SvelteKit pre-processor, then by a side-project, then by another side-project and finally my own AST library in Go. I did not plan any of this"
date: '2026-03-27'
thumbnailText: "Words"
categories: ["Go", "TOML", "AST", "Programming Languages", "Syntax Trees"]
published: true
colorStart: "97 100% 50%"
colorEnd: "180 100% 25%"
---

> _"The frustrating part about rabbit holes is that you only recognize
> them on the way back up. And by then, you've already started
> digging a new one"_
>
> -- Unknown, or possibly me at 2am, I can't remember

This story is about one thread that kept reappearing in my own projects and problems. Different projects, different tools, different languages -- but the same underlying idea surfacing each time, a little clearer than the previous time. I'm not at the end of it. I'm not sure there is an end, but I've learned enough to now at least describe the shape of what I've been circling.

## Act I -- Mdsvex, and the realization that its all just text

In previous blogs I described how I struggled to setup Mermaid diagrams in my own Svelte blog. Everyone uses Mdsvex, a preprocessor that lets you mix Markdown and Svelte syntax in the same file. You drop it on your `svelte.config.js` and `.svx` files just work. I was curious enough to look at the how.

A Svelte processor is a function that receives the raw text of your file and returns a transformed string. That's the whole contract. Svelte's compiler never knows Mdsvex exists, by the time compilation starts, there's no Markdown left. Just valid Svelte, assembled from what you wrote. 

A string goes in, a string comes out. That's it.

``` javascript
// svelte.config.js - This is the whole integration
import { mdsvex } from 'mdsvex'

export default {
    preprocess: [mdsvex()],
    extensions: ['.svelte', '.svx', '.md']
}

```

Svelte compiles that output into JavaScript. The browser runs the JavaScript. At every stage, something is reading text and deciding what it means.

> [!note]
> Mdsvex was built by _Pngwn_ and is a genuinely elegant piece of work.
> It uses `unified` under the hood -- a plugin based ecosystem for parsing
> and transforming structured text. If you've touched remark or rehype before,
> you've already been in this world without knowing it.

This felt like a small but important thing to actually understand, rather than just accept. Your source code is not special, it's a document written in a language that tools have agreed to interpret. The compiler is a translator, the preprocessor is a translator, even the browser's JavaScript engine is a translator. There's no magic layer where text becomes something fundamentally different, just a chain of programs reading what the previous one wrote. All I wanted was Mermaid diagrams in those same pages, this is where the rabbit hole got deeper.

## Act II -- First solution, then a better one

My first attempt at getting Mermaid diagrams into Mdsvex pages worked, but it was inelegant. Because Mdsvex lets you use Svelte component syntax inside Markdown, I leaned on that. I'd drop a `<Mermaid />` component directly into the prose, pass the diagram definition as a prop, and let the component handle rendering. It worked. It was also very ugly -- Svelte syntax living inside what was supposed to just be plain Markdown, breaking the writing flow and the portability of just having plain markdown syntax.

It bothered me enough that I went back to understand what the problem with the UnifiedJS pipeline was doing to the diagrams. I wanted a solution that did not involve writing Svelte code in the native markdown. Unified is what gives you the ability to hook into the transformation pipeline and ultimately is what Mdsvex uses under the hood. I won't pretend I fully understood what I was reading at the time, but I remember landing on documentation about the abstract syntax tree (or AST for short). Seeing words like _nodes_, _visitors_, _unist_, and slowly piecing together the mental model. The Markdown isn't just processed as text, it gets parsed into a tree first. Then plugins walk the tree and transform it. Then the tree gets serialized back to text and handed off to Svelte.

Eventually, I got the Mermaid solution working the way I wanted -- code blocks with no Svelte syntax, just pure, clean Markdown. But more than a solution, what I only half-grasped was the underlying structure: The idea that a document could be represented as a tree, traversed, and surgically modified -- not with string manipulation, but at the level of meaning. All of this I filed away, and little did I know I'd need this knowledge again.

## Act III -- Protheon ETL, YAML, TOML and a Go library I didn't expect to write

Some months went by and I started working on Protheon, a project that started as a distributed task system and now: A CLI ETL application. The goal of one of the commands called `protheon config` is to allow a user to edit an ETL configuration file written in either YAML or TOML. Once such variant is a pseudo git config style of editing a file down to the property-level using `protheon config edit --<key>=<value>...`. Not only that, but configuration files also have a standard template that guide users with pre-written comments about what properties exist and what they do. Reassigning keys, both in the root document and in nested objects, this kind of work is tedious by hand and suprisingly tedious to automate. Moreover, in Go if you use the language's `marshal` and `unmarshal` capabilities you get rid of the template comments in the file.

One such example of a template file for TOML is as follows:

```toml
<-- This comments would be gone if I unmarshal -->
#  Protheon Configuration
#  Generated by: protheon config create
#  Docs: https://protheon.dev/docs/configuration
# ============================================================
<!---->

<-- This too -->
# ── Input ────────────────────────────────────────────────────
<---->
[input]
# [REQUIRED] Path to your input data source
path = ""

# [REQUIRED] File extension of the data source
# Supported: json, jsonl, csv
extension = ""

# [OPTIONAL] Compression algorithm used on the input file
# Supported: zstd, gzip, none
# compress = ""

...
```

Both formats, YAML and TOML, have Go libraries. Both have ATS representations you can work with, but they're not equal.

YAML's AST API is stable. You can parse a file into a tree, modify it with surgical precision, and marshal it back with predictable behavior. TOML also has an AST API -- but it's marked as unstable. The structure can change between minor versions and building a transformation layer on top of something that could silently rearrange itself felt like exactly the wrong foundation for a tool meant to make precise, reliable changes.

So I decided to implement my own.

This is where the abstraction I'd only read about before became something that I would have to work with and design by myself. What does a token look like? How do you represent a value that could be a string, an integer, a boolean, or a nested table? How do you preserve position information so that an error can point to the right line in the source file? Hell, how do you walk a tree in a way that's flexible enough to be useful but structure enough to be safe?!

Luckily for me, these aren't original questions. They've been answered many times, in many languages. But answering them yourself, even badly, even in a form you'll rewrite it three times, different kind of learning. You stop  thinking about a syntax tree as a concept and instead something that you have to be responsible for.

## Act IV -- The book that served as my lifeline

Somewhere in the middle of my research to save my life from torment, I discovered _Crafting Interpreters_ by Robert Nystrom. I read it online expecting only to skim the first few pages. I read for hours on end with my text editor open. The book builds an interpreter from scratch. The interpreter is built twice in two programming languages, Java and C. But what landed wasn't exactly the technical depth, even Robert mentioned that the book's intention isn't to teach you deep theory about programming languages but rather come with a "solid intuition of how a real language lives and breathes". What landed wasn't the technical depth, it was the framing and the intuition of how these systems work. I already half-knew this from university. But knowing something in a lecture and knowing it while you're in the middle of designing a node type in Go are two different kinds of knowing. The theory I already knew found its footing in something real.

___

Every step of the way -- from Mdsvex to UnifiedJs to Protheon to this book -- it was the same idea in different clothes. Text has structure. You make the structure explicit through rules, and once it's explicit, you can do almost anything with it.

I'm still building the TOML AST library. It's not yet fully done, but I understand what I'm doing in some way with the path that got me here: A path I didn't plan. Made entirely of problems I was just trying to solve.

I don't know where this little thread of thoughts will lead next, but I'm still following it.

<script lang="ts">
	import { Mail, NotebookPen } from "lucide-svelte";
	import { formatDate } from "$lib/utils/date";
	import { type Snippet } from "svelte";
	import { type LayoutData } from "./$types";
	import { ArrowLeft } from "lucide-svelte";

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<svelte:head>
	<meta property="og:type" content="article" />
</svelte:head>

<article class="max-w-3xl gap-4 mx-auto px-8 py-4">
	<header class="flex flex-col gap-4 border-b border-neutral-800 pb-8 mb-12">
		<a
			href="/blog"
			aria-label="Go back"
			class="flex flex-row gap-2 hover:text-cyan-600 transition-colors"
		>
			<ArrowLeft width="4" height="4" />
			Go Back
		</a>
		<h1 class="text-4xl sm:text-5xl text-bright font-semibold">
			{data.metadata.title}
		</h1>
		<div class="flex flex-row flex-wrap gap-2">
			{#each data.metadata.categories as category}
				<span
					class="px-2 py-1 text-[10px] tracking-wider bg-bg-dark uppercase border border-border-default"
					>{category}</span
				>
			{/each}
		</div>
		<p class="text-xl text-default">{data.metadata.description}</p>
		<p class="text-default/60">
			Published on {formatDate(data.metadata.date)}
		</p>
		<p class="text-sm text-default/60">
			Written by <a
				referrerpolicy="no-referrer"
				class="underline"
				target="_blank"
				href="https://www.linkedin.com/in/danielvillamena"
				>Daniel Villavicencio</a
			>
		</p>
	</header>

	<div class="prose">
		{@render children()}
	</div>

	<footer class="flex flex-col gap-4">
		<div class="p-8 space-y-2">
			<h2 class="text-xl font-semibold text-bright text-center">
				Let's Work Together!
			</h2>
			<p class="text-default leading-relaxed text-center">
				If you enjoyed this article and are interested in collaborating, feel
				free to reach out. You can also explore more of my blog posts using the
				links below.
			</p>
			<div class="flex flex-col sm:flex-row sm:justify-center gap-2 pt-2">
				<a
					href="/contact"
					class="inline-flex items-center justify-center gap-2 px-6 py-2 bg-bg-default border border-border-default rounded text-bright hover:bg-bg-dark transition-colors"
				>
					<Mail class="h-4 w-4" />
					Contact Me
				</a>
				<a
					href="/blog"
					class="inline-flex items-center justify-center gap-2 px-6 py-2 bg-bg-default border border-border-default rounded text-bright hover:bg-bg-dark transition-colors"
				>
					<NotebookPen class="h-4 w-4" />
					More Blog Posts
				</a>
			</div>
		</div>
	</footer>
</article>

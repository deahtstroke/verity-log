<script lang="ts">
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
	<header class="flex flex-col gap-4 border-b border-default/50 pb-8 mb-12">
		<a href="/blog" aria-label="Go back" class="flex flex-row gap-2">
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
	</header>

	<div class="prose">
		{@render children()}
	</div>
</article>

<script lang="ts">
	import type { PageProps } from "./$types";
	import { onMount } from "svelte";
	import mermaid from "mermaid";

	mermaid.initialize({ theme: "dark", startOnLoad: false });
	onMount(() => {
		setTimeout(async () => {
			await mermaid.run();
		}, 0);
	});
	let data: PageProps = $props();
</script>

<svelte:head>
	<meta property="og:title" content={data.data.metadata.title} />
	<meta property="og:description" content={data.data.metadata.description} />
	<meta property="og:url" content={data.data.url} />
	<meta property="og:image" content="/manatee.png" />
</svelte:head>

<div class="prose">
	<data.data.content />
</div>

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

<div class="prose">
	<data.data.content />
</div>

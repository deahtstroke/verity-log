<script lang="ts">
	import { onMount } from "svelte";
	import mermaid from "mermaid";
	import { Spinner } from "flowbite-svelte";

	let svg = $state("");
	let rendered: boolean = $state(false);

	mermaid.initialize({ theme: "dark", startOnLoad: false });
	onMount(async () => {
		const id = `mermaid-${crypto.randomUUID()}`;
		const { svg: output } = await mermaid.render(id, code);
		svg = output;
		rendered = true;
	});

	let { code = "" } = $props();
</script>

<div class="flex flex-col my-8">
	{#if !rendered}
		<Spinner color="sky" />
	{/if}

	{@html svg}
</div>

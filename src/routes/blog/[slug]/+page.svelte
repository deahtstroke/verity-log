<script lang="ts">
	import type { PageProps } from "./$types";
	import Metadata from "$lib/components/Metadata.svelte";
	import { onMount } from "svelte";

	let data: PageProps = $props();
</script>

<Metadata
	title={data.data.metadata.title}
	description={data.data.metadata.description}
	keywords={data.data.metadata.categories}
	author="Daniel Villavicencio"
	ogTitle={data.data.metadata.title}
	ogDescription={data.data.metadata.description}
	ogImage="https://www.danielvm.dev/manatee.png"
	ogUrl={data.data.url}
	ogType="article"
	articleMetadata={{
		date: data.data.metadata.date,
		categories: data.data.metadata.categories,
		authorUrl: "https://www.linkedin.com/in/danielvillamena",
	}}
/>

<article class="prose">
	<data.data.content />
</article>

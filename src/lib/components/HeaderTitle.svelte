<script lang="ts">
	const { title = "", description = "" } = $props<{
		title: string;
		description: string;
	}>();
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>

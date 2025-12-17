<script lang="ts">
	const {
		title = "",
		description = "",
		keywords = [],
		author = "",
		ogTitle = "",
		ogUrl = "",
		ogImage = "",
		ogType = "",
		ogDescription = "",
		articleMetadata = {} as {
			date?: string;
			categories?: string[];
			authorUrl?: string;
		},
	} = $props<{
		title: string;
		description: string;
		keywords?: string[];
		author?: string;
		ogTitle?: string;
		ogUrl?: string;
		ogImage?: string;
		ogType?: string;
		ogDescription?: string;
		articleMetadata?: {
			date?: string;
			categories?: string[];
			authorUrl?: string;
		};
	}>();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	{#if keywords && keywords.length > 0}
		<meta name="keywords" content={keywords.join(", ")} />
	{/if}
	{#if author}
		<meta name="author" content={author} />
	{/if}
	{#if ogTitle}
		<meta property="og:title" content={ogTitle} />
	{/if}
	{#if ogDescription}
		<meta property="og:description" content={ogDescription} />
	{/if}
	{#if ogUrl}
		<meta property="og:url" content={ogUrl} />
	{/if}
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
	{/if}
	{#if ogType}
		<meta property="og:type" content={ogType} />
	{/if}
	<!-- article:* elements -->
	{#if ogType === "article" && articleMetadata}
		{#if articleMetadata.date}
			<meta
				property="article:published_time"
				content={`${articleMetadata.date}T00:00:00Z`}
			/>
		{/if}
		{#if articleMetadata.authorUrl}
			<meta property="article:author_url" content={articleMetadata.authorUrl} />
		{/if}
		{#if articleMetadata.categories}
			{#each articleMetadata.categories as tag}
				<meta property="article:tag" content={tag} />
			{/each}
		{/if}
	{/if}
</svelte:head>

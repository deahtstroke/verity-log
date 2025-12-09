<script lang="ts">
	let rendered: boolean = $state(true);
	let { height = 400, code = "" } = $props();
</script>

<div class="container" style:height>
	{#if rendered}
		<pre class="mermaid">
			{code}
		</pre>
	{:else}
		<pre>Nothing to see here!</pre>
	{/if}
</div>

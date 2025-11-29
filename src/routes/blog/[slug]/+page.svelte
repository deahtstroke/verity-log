<script lang="ts">
	import type { PageProps } from "./$types";

	let data: PageProps = $props();
</script>

<div class="prose">
	<data.data.content />
</div>

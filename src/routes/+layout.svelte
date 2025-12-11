<script lang="ts">
	import "../app.css";
	import "$lib/components/Navbar.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import Navbar from "$lib/components/Navbar.svelte";

	let { children } = $props();
</script>

<Navbar />
<main class="grow">
	{@render children?.()}
</main>
<Footer />

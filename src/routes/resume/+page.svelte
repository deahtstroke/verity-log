<script>
	import Metadata from "$lib/components/Metadata.svelte";
</script>

<Metadata
	title="Daniel's Resume"
	description="Web view of Daniel Villavicencio's latest resume"
	ogTitle="Daniel's Resume"
	ogDescription="Web view of Daniel Villavicencio's latest resume"
	ogImage="/manatee.png"
	ogType="website"
	ogUrl="https://www.danielvm.dev/resume"
/>
<main class="w-dvw h-dvh">
	<iframe class="h-full w-full" src="/resume.pdf" title="Daniel's Resume"
	></iframe>
</main>

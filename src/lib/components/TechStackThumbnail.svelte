<script lang="ts">
	import { getTechIcon, getTechInitials } from "$lib/data/tech-icons";

	let { technologies = [] }: { technologies: string[] } = $props();

	const displayTechs = technologies.slice(0, 4);
</script>

<div
	class="w-full h-full bg-linear-to-br from-[#0a0e1a] to-[#1a1f2e] flex items-center justify-center"
>
	<!-- Tech Grid -->
	<div class="relative grid grid-cols-2 gap-2 p-8 z-10">
		{#each displayTechs as tech}
			{@const techIcon = getTechIcon(tech)}
			<div
				class="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center relative"
			>
				<div
					class="absolute -inset-0.5 rounded-xl opacity-10 -z-10"
					style="background: {techIcon?.color || '#64b5f6'};"
				></div>

				{#if techIcon}
					<img
						src="https://cdn.simpleicons.org/{techIcon.icon}/{techIcon.color.replace(
							'#',
							'',
						)}"
						alt={tech}
						class="w-12 h-12 object-contain"
						style="filter: drop-shadow(0 0 10px {techIcon.color});"
					/>
				{:else}
					<span class="text-2xl font-bold font-mono text-[#64b5f6]">
						{getTechInitials(tech)}
					</span>
				{/if}
			</div>
		{/each}
	</div>

	<!-- More badge -->
	{#if technologies.length > 4}
		<div
			class="absolute bottom-4 right-4 bg-[#64b5f6]/20 border border-[#64b5f6]/40 text-[#64b5f6] px-3 py-1 rounded-full text-sm font-semibold z-20"
		>
			+{technologies.length - 4}
		</div>
	{/if}
</div>

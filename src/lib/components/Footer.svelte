<script lang="ts">
	import { Github, Linkedin, Mail, type Icon as IconType } from "lucide-svelte";

	interface QuickLink {
		label: string;
		href: string;
	}

	interface ContactLink {
		label: string;
		icon: IconType;
		href: string;
	}

	const quickLinks: QuickLink[] = [
		{
			label: "Home",
			href: "/",
		},
		{
			label: "Projects",
			href: "/projects",
		},
		{
			label: "Blog",
			href: "/blog",
		},
		{
			label: "Contact",
			href: "/contact",
		},
		{
			label: "About",
			href: "/about",
		},
		{
			label: "Resume",
			href: "/resume",
		},
	];

	const contactLinks: ContactLink[] = [
		{
			label: "Github",
			href: "https://www.github.com/deahtstroke",
			icon: Github,
		},
		{
			label: "LinkedIn",
			href: "https://www.linkedin.com/in/danielvillamena",
			icon: Linkedin,
		},
		{
			label: "Email",
			href: "mailto:dvm3099@pm.me",
			icon: Mail,
		},
	];
</script>

<footer
	class="w-full bg-bg-dark/40 flex flex-col items-center text-sm text-gray-400 px-8 py-8 mt-8 mb-0"
>
	<div class="max-w-6xl flex flex-col gap-8 items-center">
		<div class="grid grid-cols-[1fr_1fr] gap-6 sm:gap-10 md:20 items-start">
			<section class="grid grid-cols-1 gap-2">
				<h2 class="text-default text-lg font-semibold">Quick Links</h2>
				{#each quickLinks as link}
					<a href={link.href} class="text-sm text-default/50">{link.label}</a>
				{/each}
			</section>
			<section class="grid grid-cols-1 gap-2">
				<h2 class="text-bright text-lg font-semibold">Contact</h2>
				{#each contactLinks as link}
					{@const Icon = link.icon}
					<div class="flex flex-row gap-2 items-center text-sm text-default/50">
						<Icon class="h-4 w-4" />
						<a href={link.href} class="">{link.label}</a>
					</div>
				{/each}
			</section>
		</div>
		<h5 class="text-sm text-default/40">
			&copy; 2025 Daniel Villavicencio. All rights reserved.
		</h5>
	</div>
</footer>

<script lang="ts">
	import type { Milestone } from "$lib/types/Milestone";
	import type { Education } from "$lib/types/Education";

	import {
		BookOpen,
		Mail,
		Github,
		Shield,
		Sparkles,
		Target,
	} from "lucide-svelte";
	import { fadeFly } from "$lib/transitions/transitions";
	import HeaderTitle from "$lib/components/HeaderTitle.svelte";

	let count: number = 0;

	let fadeCount = (): number => {
		return count++ * 25;
	};

	const milestones: Milestone[] = [
		{
			year: "June 2017",
			title: "Started Community College",
			description:
				"Began studies at Sierra College in Rocklin, CA. \nGraduated with an overall 3.74 GPA on a 4.00 scale.",
		},
		{
			year: "January 2020",
			title: "Transferred to Sacramento State University",
			description:
				"Transfered from Sierra College to Sacramento State University. \nTook upper-division classes for Computer Science.",
		},
		{
			year: "June 2022",
			title: "First Software Development Role",
			description:
				"Joined UNFI as a Software Engineer I while completing my final semester of studies.",
		},
		{
			year: "Dec 2022",
			title: "Graduated from Sacramento State",
			description:
				"Earned a Bachelor of Science in Computer Science with Cum Laude honors and a 3.77 GPA.",
		},
		{
			year: "Oct 2023 - Present",
			title: "Career Growth & Exploration",
			description:
				"Following post-COVID layoffs, focused on expanding technical dpeth through project-based learning, open-source contributions, and professional certifications, while preparing for the next major career opportunity.",
		},
	];

	const educationsAndCerts: Education[] = [
		{
			degree: "B.S. Computer Science",
			institution: "California State University, Sacramento",
			year: "2020 - 2022",
			details: "GPA: 3.77/4.00, Cum Laude honors.",
		},
		{
			degree: "A.S. Computer Science",
			institution: "Sierra College",
			year: "2017-2019",
			details: "GPA: 3.74/4.00",
		},
		{
			degree: "AWS Certified Cloud Practitioner",
			institution: "Amazon Web Services",
			year: "2025",
			details: "Foundational cloud certification for AWS",
		},
	];
</script>

<HeaderTitle
	title="About"
	description="Learn more about Daniel Villavicencio, a passionate software engineer with 
	experience in a wide variety of technologies and specializing in backend development"
/>
<main class="flex flex-col max-w-3xl mx-auto px-8 gap-8 sm:gap-12 items-center">
	<section class="flex flex-col py-12 gap-6">
		<h1
			in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}
			class="text-bright text-5xl md:text-7xl font-bold text-center"
		>
			About Me
		</h1>

		<p
			in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}
			class="sm text-center"
		>
			I'm a software engineer passionate about building scalable systems and
			elegant solutions. I specialize in backend development, distributed
			systems, and turning complex problems into simple, maintainable, and
			testable code.
		</p>
	</section>
	<!-- Philosophy -->
	<section class="flex flex-col items-center gap-6">
		<h2
			in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}
			class="text-2xl font-semibold text-bright text-center"
		>
			Philosophy
		</h2>
		<div class="flex flex-col items-center gap-2 space-y-2">
			<p in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}>
				I believe great software is built on four pillars:
			</p>
			<!-- Core Principles -->
			<div class="grid md:grid-cols-2 gap-6 p-5">
				<div
					in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}
					class="space-y-3 bg-bg-dark border border-border-default rounded-lg p-6 hover:border-border-default transition-colors"
				>
					<div
						class="w-12 h-12 rounded-lg bg-bg-card border border-neutral flex items-center justify-center"
					>
						<Sparkles class="w-6 h-6 text-cyan-400/80" />
					</div>
					<h3 class="text-lg font-semibold text-bright">Simplicity</h3>
					<p class="text-sm text-default">
						Code should be easy to understand and maintain. The best solutions
						are often the simplest ones.
					</p>
				</div>
				<div
					in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}
					class="space-y-3 bg-bg-dark border border-border-default rounded-lg p-6 hover:border-border-default transition-colors"
				>
					<div
						class="w-12 h-12 rounded-lg bg-bg-card border border-neutral flex items-center justify-center"
					>
						<Shield class="w-6 h-6 text-emerald-400/80" />
					</div>
					<h3 class="text-lg font-semibold text-bright">Reliability</h3>
					<p class="text-sm text-default">
						Systems should be resilient and handle failures gracefully. Trust is
						built through consistency.
					</p>
				</div>
				<div
					in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}
					class="space-y-3 bg-bg-dark border border-border-default rounded-lg p-6 hover:border-border-default transition-colors"
				>
					<div
						class="w-12 h-12 rounded-lg bg-bg-card border border-neutral flex items-center justify-center"
					>
						<Target class="w-6 h-6 text-orange-400/80" />
					</div>
					<h3 class="text-lg font-semibold text-bright">Practicality</h3>
					<p class="text-sm text-default">
						Solutions should solve real problems effectively. Pragmatism over
						perfection.
					</p>
				</div>
				<div
					in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}
					class="space-y-3 bg-bg-dark border border-border-default rounded-lg p-6 hover:border-border-default transition-colors"
				>
					<div
						class="w-12 h-12 rounded-lg bg-bg-card border border-neutral flex items-center justify-center"
					>
						<BookOpen class="w-6 h-6 text-blue-400/80" />
					</div>
					<h3 class="text-lg font-semibold text-bright">Comprehensiveness</h3>
					<p class="text-sm text-default">
						Good documentation and testing make code accessible and maintainable
						for everyone.
					</p>
				</div>
			</div>
			<p
				class="text-center"
				in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}
			>
				I approach problems with curiosity and practicality, seeking the
				simplest effective solution. I emphasize clean architecture, deliberate
				design, robust testing, and a mindset of continuous improvement.
			</p>
		</div>
	</section>
	<!-- Biography -->
	<section class="flex flex-col items-center gap-6">
		<h2
			in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}
			class="text-2xl font-semibold text-bright text-center"
		>
			Background
		</h2>
		<div class="flex flex-col items-start gap-4">
			<p in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}>
				My journey began in June 2017 when I started community college at Sierra
				College. I declared Computer Science as my major without realizing how
				much I would come to love it. Having spent most of my life around
				computers, I’d always been curious about what was happening “under the
				hood.” As the months went by and I took more classes, I found that
				everything outside of Computer Science felt a bit dull in comparison, a
				subtle but clear sign that my blind-choice was the correct one (thank
				God).
			</p>
			<p in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}>
				After transferring to California State University, Sacramento, I dove
				deeper in my coursework with advanced topics like Database Management
				Systems and Operating Systems, which sparked my interest even further.
				During the summer of my senior year, I landed a full-time offer at UNFI
				as a Software Engineer I. My final semester was a balancing act, working
				full-time while completing my remaining coursework. It was challenging
				for sure, but in December 2022, I proudly graduated with honors with a
				Bachelor of Science in Computer Science.
			</p>
			<p in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}>
				After graduation, I continued working at UNFI learning as much as I
				could from my coworkers and mentors, until post-COVID layoffs affected
				my position and those of several colleagues. Although it was a setback,
				the experience had already ignited my curiosity for new technologies and
				concepts that I hadn’t explored in college. I became fascinated by
				distributed systems and cluster workloads. Even the word “cluster” felt
				like a glimpse into something powerful and complex that I had to
				explore. Since then, I’ve focused on deepening my knowledge beyond what
				I learned in school and building projects that are fun, challenging, and
				meaningful to me.
			</p>
			<p in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}>
				Fueled by passion, curiosity, and caffeine, I strive to grow into an
				even better software engineer, collaborate with teams that care deeply
				about what they build, and continue connecting with others who share the
				same drive and enthusiasm for technology.
			</p>
		</div>
	</section>

	<!-- Milestones -->
	<section class="flex flex-col gap-6 items-center w-full">
		<h2
			in:fadeFly|global={{ delay: fadeCount(), duration: 300, y: 20 }}
			class="text-2xl font-semibold text-bright"
		>
			Career Milestones
		</h2>
		<div class="relative space-y-4 w-full">
			<!-- Vertical line -->
			<div class="absolute left-2 top-2 bottom-2 w-px bg-white/20"></div>
			{#each milestones as milestone}
				<div class="relative pl-10">
					<!-- Dot -->
					<div
						class="absolute left-0 top-2 w-4 h-4 rounded-full bg-bg-default border-2 border-white/20"
					></div>

					<div
						in:fadeFly={{ delay: fadeCount(), duration: 300, y: 20 }}
						class="space-y-2"
					>
						<div
							class="flex flex-col md:flex-row md:justify-between gap-1 md:gap-4"
						>
							<h3 class="text-lg font-medium text-bright">
								{milestone.title}
							</h3>
							<span class="text-sm font-medium text-white/40"
								>{milestone.year}</span
							>
						</div>
						<div class="flex flex-col gap-1">
							{#each milestone.description.split("\n") as desc}
								<p class="text-sm text-default leading-relaxed max-w-2xl">
									{desc}
								</p>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Education + Certifications -->
	<section class="flex flex-col gap-6 w-full">
		<h2 class="text-2xl font-semibold text-bright text-center">
			Education & Certifications
		</h2>
		<div class="space-y-2">
			{#each educationsAndCerts as education}
				<div class="space-y-2 pb-6 border-b border-neutral-800 last:border-0">
					<div
						class="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2"
					>
						<h3 class="text-lg font-medium text-bright">{education.degree}</h3>
						<span class="text-sm text-bright/40">{education.year}</span>
					</div>
					<p class="text-sm text-bright/50">{education.institution}</p>
					<p class="text-sm text-bright/60">{education.details}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- CTA -->
	<section class="flex flex-col gap-6">
		<div class="p-8 space-y-2">
			<h2 class="text-xl font-semibold text-bright text-center">
				Let's Connect
			</h2>
			<p class="text-bright/60 text-sm leading-relaxed text-center">
				Interested in working together or just want to chat about tech? I'm
				always open to interesting conversations and new opportunities.
			</p>
			<div class="flex flex-col sm:flex-row sm:justify-center gap-2 pt-2">
				<a
					href="/contact"
					class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-bg-default border border-border-default rounded text-bright hover:bg-bg-dark transition-colors"
				>
					<Mail class="h-4 w-4" />
					Contact Me
				</a>
				<a
					href="https://github.com/deahtstroke"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-bg-default border border-border-default rounded text-bright hover:bg-bg-dark transition-colors"
				>
					<Github class="w-4 h-4" />
					View my work
				</a>
			</div>
		</div>
	</section>
</main>

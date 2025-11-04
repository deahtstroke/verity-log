<script lang="ts">
	import {
		CheckCircle2,
		Cloud,
		Code,
		Download,
		GithubIcon,
		LinkedinIcon,
		Mail,
		MapPin,
		Server,
		Timer,
	} from "lucide-svelte";
	import { onMount } from "svelte";
	import { fadeFly } from "$lib/transitions/transitions";
	import type { ContactRequest, InquiryType } from "$lib/types/ContactRequest";

	const inquiries: InquiryType[] = [
		"General Inquiry",
		"Project Collaboration",
		"Job Opportunity",
		"Freelance Work",
		"Bug Report",
		"Other",
	];

	let count: number = 0;
	let staggeredCount: (reset: boolean) => number = (reset) => {
		if (reset) {
			count = 0;
		}
		return count++ * 25;
	};

	type SubmissionStatus = "idle" | "submitting" | "success" | "error";

	let formData = $state<ContactRequest>({
		name: "",
		email: "",
		inquiryType: "",
		subject: "",
		message: "",
		cfToken: "",
	});

	let errors = $state<Record<string, string>>({});
	let isSubmitting = $state<boolean>(false);
	let submitStatus = $state<SubmissionStatus>("idle");
	let submissionError = $state<string>("");

	function validateForm(): boolean {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		}

		if (formData.inquiryType === "" || !formData.inquiryType.trim()) {
			newErrors.inquiryType = "Inquiry type cannot be blank";
		}

		if (!formData.subject.trim()) {
			newErrors.subject = "Subject is required";
		}

		if (!formData.message.trim()) {
			newErrors.message = "Message is required";
		} else if (formData.message.trim().length < 10) {
			newErrors.message = "Message must be at least 10 characters";
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	function clearError(field: string) {
		if (errors[field]) {
			const { [field]: _, ...rest } = errors;
			errors = rest;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			isSubmitting = true;
			const contactUrl = import.meta.env.PROD
				? "https://api.danielvm.dev/contact"
				: "http://localhost:3000/contact";
			if (!contactUrl) {
				submitStatus = "error";
				throw new Error("The email API url is not set");
			}

			const response = await fetch(contactUrl, {
				method: "POST",
				body: JSON.stringify(formData),
			});

			// rate limit reached
			if (response.status === 429) {
				submitStatus = "error";
				throw new Error("Too many messages sent. Please try again later.");
			}

			if (!response.ok) {
				submitStatus = "error";
				throw new Error(
					"Unable to authenticate the legimitacy of your message",
				);
			}
			submitStatus = "success";
		} catch (error) {
			if (error instanceof Error) {
				submitStatus = "error";
				submissionError = `Oops! ${error.message}`;
			} else {
				submitStatus = "error";
				submissionError = `Something unexpected happened: ${error}`;
			}
		} finally {
			isSubmitting = false;
			setTimeout(() => {
				formData = {
					name: "",
					email: "",
					inquiryType: "",
					subject: "",
					message: "",
					cfToken: "",
				};
				submitStatus = "idle";
				submissionError = "";
			}, 3000);
		}
	}

	function getRandomSubjectPlaceholder(): string {
		const placeholders = [
			"Make it sound important 😎",
			"Insert clickbait here...",
			"The world’s shortest essay",
			"Tell me what’s up (politely)",
			"Something witty goes here",
			"Subject? I hardly know her!",
			"This better not be ‘no subject’",
			"What’s this email *really* about?",
			"Operation: Impress the recipient",
			"pls open this email 🙏",
			"Make the inbox exciting again",
			"Hot take, incoming",
			"The suspense starts here",
			"Your subject line, your legacy",
			"Professional email noises...",
			"Warning: may contain opinions",
			"Insert dramatic headline",
			"Definitely not spam",
			"Plot twist in the subject line",
			"TL;DR starts here",
		];

		const randomIndex = Math.floor(Math.random() * placeholders.length);
		return placeholders[randomIndex];
	}

	onMount(() => {
		if (window.turnstile) {
			(window as any).onTurnstileSuccess = (token: string) => {
				formData.cfToken = token;
			};
		}
	});
</script>

<main class="w-full px-8">
	<div
		class="max-w-4xl mx-auto flex flex-col items-center gap-8 sm:gap-16 md:gap-24"
	>
		<!-- Hero section -->
		<section
			class="relative flex flex-col gap-6 py-12 border-b border-neutral-800"
		>
			<h1
				in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
				class="font-bold text-center text-bright text-5xl md:text-7xl"
			>
				Get In Touch
			</h1>
			<p
				in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
				class="text-lg text-default text-center"
			>
				Have a project in mind or want to collaborate? Send me an email and I'll
				get back to you as soon as possible
			</p>
		</section>

		<div
			class="w-full grid grid-cols-1 md:grid-cols-[1fr_auto] gap-x-10 gap-y-8"
		>
			<!-- Form Submission -->
			<section class="flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<h1
						in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
						class="text-lg text-bright text-center font-semibold"
					>
						Send Me a Quick Message
					</h1>
					<p
						in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
						class="text-sm text-center"
					>
						If you have a quick inquiry to talk about, please fill the form
						below.
					</p>
				</div>

				<form onsubmit={handleSubmit} novalidate class="flex flex-col gap-6">
					<div
						hidden
						class="cf-turnstile"
						data-sitekey="0x4AAAAAAB8Kyhx16DqpPvEy"
						data-callback="onTurnstileSuccess"
					></div>
					<!-- Name -->
					<div
						in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
						class="flex flex-col gap-2"
					>
						<label for="name" class="block text-sm text-default">
							Name <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="name"
							name="name"
							autocapitalize="on"
							bind:value={formData.name}
							oninput={() => clearError("name")}
							placeholder="John Doe"
							class="w-full px-4 py-3 bg-bg-dark border border-border-default
					rounded text-bright placeholder:text-bright/40 focus:outline-none focus:border-cyan-500 transition-colors
					{errors.name ? 'border-red-500' : ''}"
						/>
						{#if errors.name}
							<p class="text-sm text-red-500">{errors.name}</p>
						{/if}
					</div>
					<!-- Email -->
					<div
						in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
						class="flex flex-col gap-2"
					>
						<label for="email" class="block text-sm text-default">
							Email <span class="text-red-500">*</span>
						</label>
						<input
							type="email"
							id="email"
							name="email"
							bind:value={formData.email}
							oninput={() => clearError("email")}
							autocomplete="email"
							placeholder="johndoe@example.com"
							class="w-full px-4 py-3 bg-bg-dark border border-border-default placeholder:text-bright/40
							rounded text-bright focus:outline-none focus:border-cyan-500 transition-colors
							{errors.email ? 'border-red-500' : ''}"
						/>
						{#if errors.email}
							<p class="text-sm text-red-500">{errors.email}</p>
						{/if}
					</div>
					<!-- Inquiry Type -->
					<div
						in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
						class="flex flex-col gap-2"
					>
						<label for="inquiryType" class="block text-sm text-default">
							Inquiry Type <span class="text-red-500">*</span>
						</label>
						<select
							id="inquiryType"
							name="inquiryType"
							bind:value={formData.inquiryType}
							oninput={() => clearError("inquiryType")}
							class="w-full px-4 py-3 bg-bg-dark border border-border-default placeholder:text-bright/40
					rounded text-default focus:outline-none focus:border-cyan-500 transition-colors
					{errors.inquiryType ? 'border-red-500' : ''}"
						>
							<option value="" hidden class="text-default/40"
								>Select an Inquiry Type</option
							>
							{#each inquiries as inquiry}
								<option value={inquiry}>{inquiry}</option>
							{/each}
						</select>
						{#if errors.inquiryType}
							<p class="text-sm text-red-500">{errors.inquiryType}</p>
						{/if}
					</div>
					<!-- Subject -->
					<div
						in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
						class="flex flex-col gap-2"
					>
						<label for="subject" class="block text-sm text-default">
							Subject <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="subject"
							name="subject"
							bind:value={formData.subject}
							oninput={() => clearError("subject")}
							placeholder={getRandomSubjectPlaceholder()}
							class="w-full px-4 py-3 bg-bg-dark border border-border-default placeholder:text-bright/40
							rounded text-bright focus:outline-none focus:border-cyan-500 transition-colors
							{errors.subject ? 'border-red-500' : ''}"
						/>
						{#if errors.subject}
							<p class="text-sm text-red-500">{errors.subject}</p>
						{/if}
					</div>
					<!-- Message body -->
					<div
						in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
						class="flex flex-col gap-2"
					>
						<label for="message" class="block text-sm text-default">
							Message <span class="text-red-500">*</span>
						</label>
						<textarea
							id="message"
							name="message"
							bind:value={formData.message}
							oninput={() => clearError("message")}
							rows="8"
							class="w-full px-4 py-3 bg-bg-dark border border-border-default text-white placeholder-neutral-500
					rounded focus:outline-none focus:border-cyan-500 transition-colors resize-none
					{errors.message ? 'border-red-500' : ''}"
							placeholder="Tell me about your project..."
						></textarea>
						{#if errors.message}
							<p class="text-sm text-red-500">{errors.message}</p>
						{/if}
					</div>

					<!-- Submission -->
					<div
						in:fadeFly={{ delay: staggeredCount(true), duration: 300, y: 20 }}
						class="flex flex-col gap-2"
					>
						<button
							aria-label="Message submission button"
							type="submit"
							class="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-bright
					rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isSubmitting}
						>
							{#if isSubmitting}
								<div
									class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
								></div>
								<span>Send Message</span>
							{:else if submitStatus === "success"}
								<CheckCircle2 class="w-5 h-5" />
								<span>Message Sent!</span>
							{:else}
								<span>Send Message</span>
							{/if}
						</button>

						{#if submitStatus === "success"}
							<p class="text-sm text-green-500">
								Thanks for reaching out! I'll get back to you soon.
							</p>
						{:else if submitStatus === "error"}
							<p class="text-sm text-red-500">
								{submissionError}
							</p>
						{/if}
					</div>
				</form>
				<script
					src="https://challenges.cloudflare.com/turnstile/v0/api.js"
					async
					defer
				></script>
			</section>

			<!-- Sidebar -->
			<div class="flex flex-col items-center gap-6">
				<!-- Contact Information -->
				<section
					in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
					class="border border-border-default rounded w-full p-4"
				>
					<h3 class="text-lg font-semibold text-bright pb-2 text-center">
						Contact Information
					</h3>
					<div class="flex flex-col gap-2 text-sm">
						<a
							href="mailto:dvm3099@pm.me"
							class="flex items-start gap-3 text-default hover:text-cyan-600 transition-colors group"
						>
							<Mail class="w-5 h-5 shrink-0" />
							<div>
								<p class="text-xs text-default/40">Email</p>
								<p class="group-hover: underline">dvm3099@pm.me</p>
							</div>
						</a>
						<div class="flex items-start gap-3 text-default">
							<MapPin class="w-5 h-5 shrink-0" />
							<div>
								<p class="text-xs text-default/40">Location</p>
								<p>Roseville, CA</p>
								<p>(Available for remote work)</p>
							</div>
						</div>
						<div class="flex items-start gap-3 text-default/">
							<Timer class="w-5 h-5 shrink-0" />
							<div>
								<p class="text-xs text-default/40">Timezone</p>
								<p>PST (UTC-7)</p>
							</div>
						</div>
					</div>
				</section>

				<!-- Socials -->
				<section
					in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
					class="border border-border-default w-full rounded p-4"
				>
					<h3 class="text-lg font-semibold text-bright pb-2 text-center">
						Socials
					</h3>
					<div class="flex flex-col gap-2">
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://www.github.com/deahtstroke"
							class="group text-default hover:text-cyan-600 transition-colors"
						>
							<div class="flex items-start gap-3">
								<GithubIcon class="w-5 h-5 shrink-0" />
								<p class="text-sm">GitHub</p>
							</div>
						</a>
						<a
							href="https://www.linkedin.com/in/danielvillamena"
							target="_blank"
							rel="noopener noreferrer"
							class="group text-default hover:text-cyan-600 transition-colors"
						>
							<div class="flex items-start gap-3">
								<LinkedinIcon class="w-5 h-5 shrink-0" />
								<p class="text-sm">LinkedIn</p>
							</div>
						</a>
					</div>
				</section>

				<!-- Download Resume -->
				<section
					in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
					class="group flex items-center w-full px-6 py-3 border border-border-default rounded
					hover:border-cyan-600 transition-colors"
				>
					<a
						href="/resume.pdf"
						download
						target="_blank"
						rel="noopener noreferrer"
						class="m-auto text-default group-hover:text-cyan-600 transition-colors"
						aria-label="open resume"
					>
						<div class="flex flex-start gap-3">
							<Download class="h-5 w-5" />
							Download Resume
						</div>
					</a>
				</section>

				<!-- Project Interests -->
				<section
					in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
					class="border border-border-default p-4 w-full rounded"
				>
					<h3 class="text-lg text-bright font-semibold text-center pb-2">
						Project Interests
					</h3>
					<div class="flex flex-col gap-2">
						<div class="flex flex-start gap-3 text-default">
							<Server class="w-5 h-5 text-cyan-500 shrink-0" />
							<span class="text-sm">Backend Systems</span>
						</div>
						<div class="flex flex-start gap-3 text-default">
							<Cloud class="w-5 h-5 text-cyan-500 shrink-0" />
							<span class="text-sm">Cloud Systems</span>
						</div>
						<div class="flex flex-start gap-3 text-default">
							<Code class="w-5 h-5 text-cyan-500 shrink-0" />
							<span class="text-sm">DevOps & CI/CD</span>
						</div>
					</div>
				</section>

				<!-- Availability Status -->
				<section
					in:fadeFly={{ delay: staggeredCount(false), duration: 300, y: 20 }}
					class="border border-border-default rounded w-full p-4"
				>
					<h3 class="text-lg font-semibold text-center text-bright pb-2">
						Availability
					</h3>
					<div class="flex flex-col gap-2">
						<div class="flex items-center gap-3">
							<div class="w-2 h-2 bg-green-500 rounded-full"></div>
							<span class="text-sm text-default">Open to new projects</span>
						</div>
						<div class="flex items-center gap-3">
							<div class="w-2 h-2 bg-green-500 rounded-full"></div>
							<span class="text-sm text-default"
								>Response time: 24-48 hours</span
							>
						</div>
					</div>
				</section>
			</div>
		</div>
	</div>
</main>

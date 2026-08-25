import { mdsvex, escapeSvelte } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter } from 'shiki';
import { transformerCopyButton } from '@rehype-pretty/transformers'
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import callouts from 'rehype-callouts';
import adapter from '@sveltejs/adapter-cloudflare';
import rehypeSlug from 'rehype-slug';

const highlighterPromise = createHighlighter({
	themes: ['catppuccin-frappe', 'catppuccin-mocha', 'material-theme-ocean', 'material-theme', 'dracula'],
	langs: ['go', 'json', 'yaml', 'bash']
})

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	extensions: ['.svelte', '.svx', ".md"],
	preprocess: [vitePreprocess(), mdsvex({
		extensions: [".md", ".svx"],
		highlight: {
			highlighter: async (code, lang = 'text') => {
				if (lang === 'mermaid') {
					// Return a raw div that the client-side library will target
					// We wrap in {@html} to ensure Svelte doesn't parse it
					return `{@html \`<pre class="mermaid">${code}</pre>\`}`;
				}
				const highlighter = await highlighterPromise
				await highlighter.loadLanguage('go', 'json', 'svelte', 'mermaid', 'markdown', 'toml', 'bash');
				let html = escapeSvelte(
					highlighter.codeToHtml(code, {
						lang,
						theme: 'catppuccin-frappe',
						transformers: [
							transformerCopyButton({ visibility: 'always', feedbackDuration: 3_000 }),
						]
					}
					));
				return `{@html \`${html}\`}`
			}
		},
		rehypePlugins: [
			[callouts, { theme: 'github' }],
			rehypeSlug,
			[rehypeAutolinkHeadings, {
				behavior: "wrap",
				properties: {
					className: 'heading-anchor',
				}
			}]
		],
	})],
	kit: { // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
	},
};

export default config;

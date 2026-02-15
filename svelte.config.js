import { mdsvex, escapeSvelte } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter } from 'shiki';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import adapter from '@sveltejs/adapter-cloudflare';
import rehypeSlug from 'rehype-slug';

const highlighterPromise = createHighlighter({
	themes: ['catppuccin-mocha'],
	langs: ['go', 'json']
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
				await highlighter.loadLanguage('go', 'json', 'svelte', 'mermaid', 'markdown');
				const html = escapeSvelte(highlighter.codeToHtml(code, { lang, theme: 'catppuccin-mocha' }));
				return `{@html \`${html}\`}`
			}
		},
		rehypePlugins: [
			rehypeSlug,
			[rehypeAutolinkHeadings, {
				behavior: "wrap",
				properties: {
					className: 'heading-anchor',
				}
			}]
		]
	})],
	kit: { // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
	},
};

export default config;

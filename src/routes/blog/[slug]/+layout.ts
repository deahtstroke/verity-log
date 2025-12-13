import { error } from '@sveltejs/kit';
import type { MdsvexModule } from '*.md'
import type { LayoutLoad } from './$types';

const ORIGIN = "https://danielvm.dev/blog"

export const load: LayoutLoad = async ({ params }) => {
	try {
		const post = await import(`$lib/posts/${params.slug}.md`) as MdsvexModule;
		return {
			content: post.default,
			metadata: post.metadata,
			url: `${ORIGIN}/${params.slug}`
		};
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		error(404, `Could not find ${params.slug}`)
	}
}

export const prerender: boolean = true;

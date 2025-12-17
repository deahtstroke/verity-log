import type { PageLoad } from "./$types";
import getPosts from "$lib/posts/posts"

export const load: PageLoad = () => {
	const posts = getPosts();
	return { posts: posts }
}

export const ssr = false;

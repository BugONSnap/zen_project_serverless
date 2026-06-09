export type Subreddit = {
	id: string;
	label: string;
	description: string;
	icon: string;
	color: string;
};

export const SUBREDDITS: Subreddit[] = [
	{ id: 'zenttry', label: 'r/zenTry', description: 'General community hub', icon: '🌸', color: '#fbbf24' },
	{ id: 'webdev', label: 'r/webdev', description: 'Web development talk', icon: '🌐', color: '#60a5fa' },
	{ id: 'javascript', label: 'r/javascript', description: 'JS help & discussions', icon: '⚡', color: '#f59e0b' },
	{ id: 'csshelp', label: 'r/csshelp', description: 'Styling & layout help', icon: '🎨', color: '#a78bfa' },
	{ id: 'playground', label: 'r/playground', description: 'Share playground projects', icon: '💻', color: '#34d399' },
	{ id: 'students', label: 'r/students', description: 'Student learners', icon: '📚', color: '#f472b6' },
	{ id: 'career', label: 'r/career', description: 'Dev career advice', icon: '💼', color: '#fb923c' },
	{ id: 'askzenttry', label: 'r/askZenTry', description: 'Platform Q&A', icon: '❓', color: '#38bdf8' }
];

const SUBREDDIT_PREFIX = /^\[(r\/[^\]]+)\]\s*/;

const USER_TYPE_SUBREDDIT: Record<string, string> = {
	STUDENT: 'students',
	PROFESSIONAL: 'career',
	HOBBYIST: 'playground'
};

export function parseSubredditFromContent(content: string): string | null {
	const match = content.match(SUBREDDIT_PREFIX);
	return match ? match[1].slice(2) : null;
}

export function getPostSubreddit(post: { content: string; user?: { userType?: { name?: string } } }): string {
	const fromContent = parseSubredditFromContent(post.content);
	if (fromContent) return fromContent;
	return USER_TYPE_SUBREDDIT[post.user?.userType?.name ?? ''] || 'zenttry';
}

export function getSubredditMeta(id: string): Subreddit {
	return SUBREDDITS.find((s) => s.id === id) ?? SUBREDDITS[0];
}

export function stripSubredditPrefix(content: string): string {
	return content.replace(SUBREDDIT_PREFIX, '');
}

export function withSubredditPrefix(subredditId: string, text: string): string {
	return `[r/${subredditId}] ${text.trim()}`;
}

export function getPostScore(post: { likes?: { isLike: boolean }[] }): number {
	const likes = post.likes?.filter((l) => l.isLike).length ?? 0;
	const dislikes = post.likes?.filter((l) => !l.isLike).length ?? 0;
	return likes - dislikes;
}

export function countPostsBySubreddit<T extends { content: string; user?: { userType?: { name?: string } } }>(
	posts: T[]
): (Subreddit & { count: number })[] {
	return SUBREDDITS.map((sub) => ({
		...sub,
		count: posts.filter((p) => getPostSubreddit(p) === sub.id).length
	}));
}

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user
		? {
				id: locals.user.id,
				username: locals.user.username,
				email: locals.user.email
			}
		: null;

	return { user };
};

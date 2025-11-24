import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user
        ? {
              id: locals.user.id,
              username: locals.user.username,
              email: locals.user.email
          }
        : null;

    return { user };
};



// No redirect. The root route can now be used for a landing page or navigation.
import { redirect } from '@sveltejs/kit';

export const load = () => {
    throw redirect (307, '/landing');
};
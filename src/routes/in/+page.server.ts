import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    // if on the /in page, redirect to /in/overview
    redirect(303, '/in/overview');
};
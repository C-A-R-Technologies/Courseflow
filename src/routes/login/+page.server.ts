import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, locals }) => {
    // If user is already logged in, redirect to home page
    if (locals.user) {
        throw redirect(303, '/in/overview');
    }
};
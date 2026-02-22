import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
    // redirect back to overview since this page is not implemented yet
    redirect(303, "/in/overview");
};
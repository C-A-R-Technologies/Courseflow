import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
    // redirect to the overview page for now, until login is implemented
    // redirect(302, "/in/overview");
};
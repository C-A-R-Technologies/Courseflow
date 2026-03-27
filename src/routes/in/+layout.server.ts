import { sql } from "$lib/server/postgres";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { Term } from "$lib/models";

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(303, "/login");

    const termResult = await sql`
        SELECT *
        FROM terms
        WHERE starts_at <= now() AND ends_at >= now()
        LIMIT 1
    `;

    const term = termResult.length > 0 ? Term.parse(termResult[0]) : null;

    return {
        user: locals.user!,
        term,
    };
};
import { query } from "$app/server";
import { sql } from "$lib/server/postgres";
import z from "zod";

export const getActiveEnrollments = query(z.object({ userId: z.uuid(), termId: z.uuid() }), async ({ userId, termId }) => {
    const enrollments = await sql`
        SELECT COUNT(e2.id)
        FROM enrollments e2
        JOIN sections s2 ON e2.section_id = s2.id
        WHERE e2.user_id = ${userId} AND s2.term_id = ${termId}
    `;

    return enrollments[0]?.count || 0;
});
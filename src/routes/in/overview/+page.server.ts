import type { PageServerLoad } from './$types';
import { User, Term, StudentCourseOverview, FacultyCourseOverview } from '$lib/models';
import { sql } from '$lib/server/postgres';
import { fetchTermAuto } from '$lib/server/postgres';

type StudentData = {
    user: User & { role: "student" };
    term: Term | null;
    courseOverviews: StudentCourseOverview[];
};

type InstructorData = {
    user: User & { role: "instructor" };
    term: Term | null;
    courseOverviews: FacultyCourseOverview[];
};

type AdminDeanData = { // temp
    user: User & { role: "admin" | "dean" };
    term: Term | null;
    courseOverviews: [];
};

type OverviewPageData = StudentData | InstructorData | AdminDeanData;

export const load = (async ({ locals }): Promise<OverviewPageData> => {
    const activeTerm = await fetchTermAuto();
    if (!activeTerm) {
        console.warn("No active term found");
        // the sql statements will just have no results so no need to return here
    }

    if (locals.user.role === "admin") {
        console.log("Loading admin data for user:", locals.user.email);
        return { user: locals.user, term: activeTerm, courseOverviews: [] };
    }

    if (locals.user.role === "dean") {
        console.log("Loading dean data for user:", locals.user.email);
        return { user: locals.user, term: activeTerm, courseOverviews: [] };
    }

    if (locals.user.role === "instructor") {
        console.log("Loading instructor data for user:", locals.user.email);

        const courseOverviewResult = await sql`
            SELECT
                s.id AS section_id,
                s.code AS section_code,
                c.id AS course_id,
                c.course_name,
                CASE
                    WHEN u.id IS NULL THEN 'TBA'
                    ELSE CONCAT(u.firstname, ' ', u.lastname)
                END AS instructor_name,
                ef.id AS evaluation_form_id,
                ef.opens_at AS evaluation_form_opens_at,
                ef.closes_at AS evaluation_form_closes_at,
                (
                    SELECT COUNT(*)
                    FROM evaluation_completions ec2
                    WHERE ec2.form_id = ef.id
                ) AS evaluations_completed
            FROM enrollments e
            JOIN sections s ON e.section_id = s.id
            JOIN courses c ON s.course_id = c.id
            LEFT JOIN users u ON s.instructor_id = u.id
            JOIN evaluation_forms ef ON ef.section_id = s.id
            LEFT JOIN evaluation_completions ec
                ON ec.form_id = ef.id
               AND ec.user_id = e.user_id
            WHERE e.user_id = ${locals.user.id}
            ORDER BY ef.closes_at ASC, s.code ASC
        `;

        const courseOverviews = courseOverviewResult.map(row => FacultyCourseOverview.parse(row));
        return { user: locals.user, term: activeTerm, courseOverviews };
    }

    if (locals.user.role === "student") {
        console.log("Loading student data for user:", locals.user.email);

        const courseOverviewResult = await sql`
            SELECT
                s.id AS section_id,
                s.code AS section_code,
                c.id AS course_id,
                c.course_name,
                CASE
                    WHEN u.id IS NULL THEN 'TBA'
                    ELSE CONCAT(u.firstname, ' ', u.lastname)
                END AS instructor_name,
                ef.id AS evaluation_form_id,
                ef.opens_at AS evaluation_form_opens_at,
                ef.closes_at AS evaluation_form_closes_at,
                ec.id IS NOT NULL AS evaluation_completed,
                ec.submitted_at AS evaluation_completed_at
            FROM enrollments e
            JOIN sections s ON e.section_id = s.id
            JOIN courses c ON s.course_id = c.id
            LEFT JOIN users u ON s.instructor_id = u.id
            JOIN evaluation_forms ef ON ef.section_id = s.id
            LEFT JOIN evaluation_completions ec
                ON ec.form_id = ef.id
               AND ec.user_id = e.user_id
            WHERE e.user_id = ${locals.user.id}
            ORDER BY ef.closes_at ASC, s.code ASC
        `;

        const courseOverviews = courseOverviewResult.map(row => StudentCourseOverview.parse(row));
        return { user: locals.user, term: activeTerm, courseOverviews };
    }

    console.warn("User has unknown role, returning just user data:", locals.user.email, locals.user.role);
    return { user: locals.user, term: activeTerm, courseOverviews: [] };
}) satisfies PageServerLoad;

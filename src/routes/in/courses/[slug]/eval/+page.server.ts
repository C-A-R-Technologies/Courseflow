import type { PageServerLoad } from './$types';
import { EvaluationQuestion, EvaluationQuestionOption } from '$lib/models';
import { sql } from '$lib/server/postgres';
import { error } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
    const { slug } = params;

    const sectionResult = await sql`
        SELECT
            s.id AS section_id,
            s.code AS section_code,
            c.id AS course_id,
            c.course_name,
            c.school_id,
            ef.id AS evaluation_form_id,
            ef.opens_at,
            ef.closes_at
        FROM sections s
        JOIN courses c ON s.course_id = c.id
        JOIN evaluation_forms ef ON ef.section_id = s.id
        WHERE s.id = ${slug}
        LIMIT 1
    `;

    const section = sectionResult[0];
    if (!section) {
        throw error(404, 'Evaluation form not found for this section');
    }

    const questionRows = await sql`
        SELECT q.*
        FROM evaluation_questions q
        JOIN evaluation_categories ec ON q.category_id = ec.id
                WHERE (q.school_id = ${section.school_id} OR q.school_id IS NULL)
          AND q.active = true
        ORDER BY ec.sort_index ASC, q.created_at ASC
    `;

    const optionRows = await sql`
        SELECT o.*
        FROM evaluation_question_options o
        JOIN evaluation_questions q ON o.question_id = q.id
        JOIN evaluation_categories ec ON q.category_id = ec.id
                WHERE (q.school_id = ${section.school_id} OR q.school_id IS NULL)
          AND q.active = true
        ORDER BY q.category_id ASC, o.question_id ASC, o.sort_index ASC
    `;

    const questions = questionRows.map((row) => EvaluationQuestion.parse(row));
    const options = optionRows.map((row) => EvaluationQuestionOption.parse(row));

    const optionsByQuestionId = Object.groupBy(options, (option) => option.question_id);

    return {
        user: locals.user,
        section: {
            id: section.section_id,
            code: section.section_code,
            course_id: section.course_id,
            course_name: section.course_name,
            evaluation_form_id: section.evaluation_form_id,
            opens_at: section.opens_at,
            closes_at: section.closes_at,
        },
        questions: questions.map((question) => ({
            ...question,
            options: optionsByQuestionId[question.id] ?? [],
        })),
    };
}) satisfies PageServerLoad;
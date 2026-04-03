import { paraglideMiddleware } from '$lib/paraglide/server';
import { privateEnv } from "$lib/env/private";
import { User } from "$lib/models";
import { hashPassword, verifyToken } from "$lib/server/auth";
import {
	BASE_EVALUATION_QUESTION_SEEDS,
	EVALUATION_CATEGORY_SORT_INDEX,
} from "$lib/server/seeds/evaluation";
import { SCHOOL_SEEDS } from "$lib/server/seeds/schools";
import { sql } from "$lib/server/postgres";
import { type Handle, type ServerInit } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const handleParaglide: Handle = ({ event, resolve }) => paraglideMiddleware(event.request, ({ request, locale }) => {
	event.request = request;

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
	});
});

export const init: ServerInit = async () => {
	if (privateEnv.init.email && privateEnv.init.password) {
		const { email, password } = privateEnv.init;
		const init_firstname = "Coursey";
		const init_lastname = "McCourseFlow";
		const init_role = "admin"; // Don't change

		async function init() {
			const hashedPassword = await hashPassword(password);

			const result = await sql`
                INSERT INTO users (email, firstname, lastname, role, password_hash, created_at, updated_at)
                VALUES (
                    ${email},
                    ${init_firstname},
                    ${init_lastname},
                    ${init_role},
                    ${hashedPassword},
					now(),
					now()
                )
                ON CONFLICT DO NOTHING
                RETURNING *
            `;

			if (result.length > 0) {
				console.log(
					"Created an admin user with the email provided in the INIT_EMAIL environment variable.",
				);
				// Load test data
				// const file = fs.readFileSync("./src/lib/utils/testdata.sql", "utf8");
				// await db.unsafe(file);
				// console.log("Loaded test data");
			} else
				console.warn(
					"A user with the email provided in the INIT_EMAIL environment variable already exists.",
				);
		}

		init().catch(console.error);
	}

	if (privateEnv.smtp) console.log("SMTP is configured for outgoing emails.");
	else console.warn("SMTP is not fully configured. Outgoing emails will not be sent.");

	try {
		await sql`ALTER TABLE evaluation_questions ALTER COLUMN school_id DROP NOT NULL`;
		await sql`ALTER TABLE evaluation_categories ALTER COLUMN school_id DROP NOT NULL`;

		const existingEvaluationQuestions = await sql`SELECT 1 FROM evaluation_questions LIMIT 1`;

		if (existingEvaluationQuestions.length > 0) {
			console.log("Questions already exist; skipping question initialization.");
		} else {
			const categoryIds = new Map<string, string>();

			for (const [name, sortIndex] of Object.entries(EVALUATION_CATEGORY_SORT_INDEX)) {
				const existingCategory = await sql`
					SELECT id
					FROM evaluation_categories
					WHERE school_id IS NULL
					AND name = ${name}
					LIMIT 1
				`;

				if (existingCategory.length > 0) {
					categoryIds.set(name, String(existingCategory[0].id));
					continue;
				}

				const insertedCategory = await sql`
					INSERT INTO evaluation_categories (school_id, sort_index, name, created_at, updated_at)
					VALUES (NULL, ${sortIndex}, ${name}, now(), now())
					RETURNING id
				`;

				if (insertedCategory.length > 0) categoryIds.set(name, String(insertedCategory[0].id));
			}

			for (const question of BASE_EVALUATION_QUESTION_SEEDS) {
				const categoryId = categoryIds.get(question.category);
				if (!categoryId) continue;

				await sql`
					INSERT INTO evaluation_questions (school_id, category_id, response_kind, prompt, required, active, created_at, updated_at)
					VALUES (NULL, ${categoryId}, ${question.responseKind}, ${question.prompt}, ${question.required}, true, now(), now())
				`;
			}

			console.log(`Inserted ${BASE_EVALUATION_QUESTION_SEEDS.length} base questions.`);
		}

		const questionsNeedingOptions = await sql`
			SELECT q.id, q.response_kind
			FROM evaluation_questions q
			WHERE NOT EXISTS (
				SELECT 1
				FROM evaluation_question_options o
				WHERE o.question_id = q.id
			)
		`;

		let optionRowsInserted = 0;

		for (const question of questionsNeedingOptions) {
			const questionId = String(question.id);
			const responseKind = String(question.response_kind);

			if (responseKind === "agreement_scale") {
				for (let i = 1; i <= 10; i++) {
					await sql`
						INSERT INTO evaluation_question_options (question_id, label, numeric_score, sort_index, created_at, updated_at)
						VALUES (${questionId}, ${String(i)}, ${i}, ${i - 1}, now(), now())
					`;
					optionRowsInserted++;
				}
				continue;
			}

			if (responseKind === "yes_no") {
				await sql`
					INSERT INTO evaluation_question_options (question_id, label, numeric_score, sort_index, created_at, updated_at)
					VALUES (${questionId}, ${"Yes"}, ${1}, ${0}, now(), now())
				`;
				await sql`
					INSERT INTO evaluation_question_options (question_id, label, numeric_score, sort_index, created_at, updated_at)
					VALUES (${questionId}, ${"No"}, ${0}, ${1}, now(), now())
				`;
				optionRowsInserted += 2;
			}
		}

		if (optionRowsInserted > 0) console.log(`Inserted ${optionRowsInserted} evaluation question options.`);
	}
	catch (err) {
		console.error("Failed to seed base evaluation questions:", err);
	}

	try {
		const existingSchools = await sql`
			SELECT name, abbreviation
			FROM schools
		`;

		const existingKeys = new Set(
			existingSchools.map(s => `${String(s.name).toLowerCase()}|${String(s.abbreviation).toLowerCase()}`)
		);
		let inserted = 0;

		for (const school of SCHOOL_SEEDS) {
			const key = `${school.name.toLowerCase()}|${school.abbreviation.toLowerCase()}`;
			if (existingKeys.has(key)) continue;

			await sql`
				INSERT INTO schools (name, abbreviation, created_at, updated_at)
				VALUES (${school.name}, ${school.abbreviation}, now(), now())
			`;

			existingKeys.add(key);
			inserted++;
		}

		if (inserted === 0) console.log("Schools already exist; skipping school initialization.");
		else console.log(`Inserted ${inserted} schools.`);
	}
	catch (err) {
		console.error("Failed to seed schools:", err);
	}
};

export const auth = (async ({ event, resolve }) => {
	const token = event.cookies.get("authorization");

	if (token && token.startsWith("Bearer ")) {
		const payload = verifyToken(token.substring(7), "access", () => {
			event.cookies.delete("authorization", {
				path: "/",
			});
		});

		if (payload) {
			const users = await sql`
                SELECT *
                FROM users
                WHERE id = ${payload.sub}
                LIMIT 1
            `.catch(() => []);

			if (users.length) event.locals.user = User.parse(users[0]);
		}
	}

	return resolve(event);
}) satisfies Handle;

export const handle = sequence(handleParaglide, auth);

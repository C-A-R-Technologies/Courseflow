import { paraglideMiddleware } from '$lib/paraglide/server';
import { privateEnv } from "$lib/env/private";
import { publicEnv } from "$lib/env/public";
import { User } from "$lib/models";
import { hashPassword, verifyToken } from "$lib/server/auth";
import { db, sql } from "$lib/server/postgres";
import { type Handle, type ServerInit } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import fs from "fs";

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

	if (publicEnv.init_evaluation_json) {
		const filePath = publicEnv.init_evaluation_json;
		try {
			await sql`ALTER TABLE questions ALTER COLUMN school_id DROP NOT NULL`;

			if (fs.existsSync(filePath)) {
				const evaluationData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
				const seedQuestions: Array<{
					category: string;
					index: number;
					type: string;
					required: boolean;
					question: string;
					notes: string | null;
				}> = [];

				const questionSets = Array.isArray(evaluationData?.questions) ? evaluationData.questions : [];

				for (const questionSet of questionSets) {
					if (!questionSet || typeof questionSet !== "object") continue;

					for (const levelSections of Object.values(questionSet)) {
						if (!Array.isArray(levelSections)) continue;

						for (const section of levelSections) {
							if (!section || typeof section !== "object") continue;

							for (const [category, categoryQuestions] of Object.entries(section)) {
								if (!["course", "instructor", "library"].includes(category)) continue;
								if (!Array.isArray(categoryQuestions)) continue;

								for (const question of categoryQuestions) {
									if (!question || typeof question !== "object") continue;

									const q = question as any;
									if (typeof q.index !== "number") continue;
									if (!["agreement_scale", "yes_no", "text"].includes(String(q.type))) continue;
									if (typeof q.required !== "boolean") continue;
									if (typeof q.question !== "string") continue;

									seedQuestions.push({
										category,
										index: q.index,
										type: String(q.type),
										required: q.required,
										question: q.question,
										notes: typeof q.notes === "string" && q.notes.trim() ? q.notes : null,
									});
								}
							}
						}
					}
				}

				if (seedQuestions.length === 0) {
					console.warn(`No valid questions found in ${filePath}; skipping question initialization.`);
				} else {
					const existing = await sql`SELECT 1 FROM questions LIMIT 1`;

					if (existing.length > 0) {
						console.log("Questions already exist; skipping question initialization.");
					} else {
						for (const q of seedQuestions) {
							await sql`
								INSERT INTO questions (index, category, type, required, question, notes)
								VALUES (${q.index}, ${q.category}, ${q.type}, ${q.required}, ${q.question}, ${q.notes})
							`;
						}

						console.log(`Inserted ${seedQuestions.length} base questions.`);
					}
				}
			}
			else {
				console.warn(`Evaluation JSON file not found at ${filePath}; skipping question initialization.`);
			}
		}
		catch (err) {
			console.error(`Failed to load evaluation JSON from ${filePath}:`, err);
		}
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

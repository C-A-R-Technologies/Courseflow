import { paraglideMiddleware } from '$lib/paraglide/server';
import { privateEnv } from "$lib/env/private";
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

import { sql } from "$lib/server/postgres";
import { form } from "$app/server";
import { LoginRequest, User } from "$lib/models";
import { error, redirect } from "@sveltejs/kit";
import { verifyPassword, generateAccessToken } from "$lib/server/auth";
import { getRequestEvent } from "$app/server";
import { privateEnv } from "$lib/env/private";

export const login = form( LoginRequest, async login => {
    const users = await sql`
        SELECT *
        FROM users
        WHERE email = ${login.email}
        LIMIT 1;
    `;

    if (users.length === 0) error(401, { message: "Invalid credentials" });

    const passwordHash = users[0]?.password_hash;

    if (!passwordHash) error(401, { message: "Invalid credentials" });

    const user = User.parse(users[0]);

    const isValidPassword = await verifyPassword(login._password, passwordHash);

    if (!isValidPassword) error(401, { message: "Invalid credentials" });

    const accessToken = generateAccessToken(user.id);

    await sql`
        UPDATE users 
        SET last_login = now(), updated_at = now()
        WHERE id = ${user.id}
    `;

    const { cookies } = getRequestEvent();

    cookies.set("authorization", `Bearer ${accessToken}`, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: privateEnv.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
    });

    redirect(303, "/in/overview");
});